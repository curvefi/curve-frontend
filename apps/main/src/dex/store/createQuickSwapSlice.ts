import lodash from 'lodash'
import { ethAddress, type Address } from 'viem'
import type { Config } from 'wagmi'
import type { StoreApi } from 'zustand'
import type {
  FormEstGas,
  FormStatus,
  FormValues,
  RoutesAndOutput,
  RoutesAndOutputModal,
  SearchedParams,
} from '@/dex/components/PageRouterSwap/types'
import { DEFAULT_FORM_STATUS, DEFAULT_FORM_VALUES } from '@/dex/components/PageRouterSwap/utils'
import { curvejsApi } from '@/dex/lib/curvejs'
import type { State } from '@/dex/store/useStore'
import { CurveApi, FnStepApproveResponse, FnStepResponse } from '@/dex/types/main.types'
import { sleep } from '@/dex/utils'
import { getMaxAmountMinusGas } from '@/dex/utils/utilsGasPrices'
import { getSlippageImpact, getSwapActionModalType } from '@/dex/utils/utilsSwap'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { fetchTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import { fetchGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'
import { setMissingProvider } from '@ui-kit/utils/store.util'
import { fetchNetworks } from '../entities/networks'

type StateKey = keyof typeof DEFAULT_STATE
const { cloneDeep } = lodash

type SliceState = {
  activeKey: string
  formEstGas: { [activeKey: string]: FormEstGas }
  formStatus: FormStatus
  formValues: FormValues
  isMaxLoading: boolean
  routesAndOutput: { [activeKey: string]: RoutesAndOutput }
}

const sliceKey = 'quickSwap'

export type QuickSwapSlice = {
  [sliceKey]: SliceState & {
    fetchMaxAmount(
      config: Config,
      curve: CurveApi,
      searchedParams: SearchedParams,
      maxSlippage: string | undefined,
    ): Promise<void>
    fetchRoutesAndOutput(
      config: Config,
      curve: CurveApi,
      searchedParams: SearchedParams,
      maxSlippage: string,
    ): Promise<void>
    fetchEstGasApproval(curve: CurveApi, searchedParams: SearchedParams): Promise<void>
    resetFormErrors(): void
    setFormValues(
      config: Config,
      curve: CurveApi | null,
      updatedFormValues: Partial<FormValues>,
      searchedParams: SearchedParams,
      maxSlippage: string,
      isGetMaxFrom?: boolean,
      isFullReset?: boolean,
      isRefetch?: boolean,
    ): Promise<void>

    // select token list
    setPoolListFormValues(hideSmallPools: boolean): void

    // steps
    fetchStepApprove(
      activeKey: string,
      config: Config,
      curve: CurveApi,
      formValues: FormValues,
      searchedParams: SearchedParams,
      globalMaxSlippage: string,
    ): Promise<FnStepApproveResponse | undefined>
    fetchStepSwap(
      activeKey: string,
      config: Config,
      curve: CurveApi,
      formValues: FormValues,
      searchedParams: SearchedParams,
      maxSlippage: string,
    ): Promise<(FnStepResponse & { swappedAmount: string }) | undefined>

    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  activeKey: '',
  formEstGas: {},
  formStatus: DEFAULT_FORM_STATUS,
  formValues: DEFAULT_FORM_VALUES,
  isMaxLoading: false,
  routesAndOutput: {},
}

export const createQuickSwapSlice = (
  _set: StoreApi<State>['setState'],
  get: StoreApi<State>['getState'],
): QuickSwapSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchMaxAmount: async (config, curve, searchedParams, maxSlippage) => {
      const state = get()
      const sliceState = state[sliceKey]

      let activeKey = sliceState.activeKey
      const { chainId, signerAddress } = curve
      const { fromAddress, toAddress } = searchedParams

      const cFormValues = cloneDeep(sliceState.formValues)

      if (signerAddress) {
        const userBalance = await fetchTokenBalance(config, {
          chainId,
          userAddress: signerAddress,
          tokenAddress: fromAddress as Address,
        })

        cFormValues.fromAmount = userBalance
        activeKey = getRouterActiveKey(curve, cFormValues, searchedParams, maxSlippage)

        // get max amount for native token
        if (fromAddress.toLowerCase() === ethAddress) {
          const networks = await fetchNetworks()
          const { basePlusPriority } = await fetchGasInfoAndUpdateLib({
            chainId,
            networks,
          })
          const firstBasePlusPriority = basePlusPriority?.[0]

          if (typeof firstBasePlusPriority !== 'undefined' && +userBalance > 0) {
            sliceState.setStateByKey('isMaxLoading', true)
            // must call routesAndOutput first before estGas
            const poolsMapper = state.pools.poolsMapper[chainId]
            await curvejsApi.router.routesAndOutput(activeKey, curve, poolsMapper, cFormValues, searchedParams)

            const resp = await curvejsApi.router.estGasApproval(activeKey, curve, fromAddress, toAddress, userBalance)

            if (resp.estimatedGas) {
              cFormValues.fromAmount = getMaxAmountMinusGas(resp.estimatedGas, firstBasePlusPriority, userBalance)
            }
          }
        }
      } else {
        cFormValues.fromAmount = ''
      }

      sliceState.setStateByKeys({
        activeKey: getRouterActiveKey(curve, cFormValues, searchedParams, maxSlippage),
        formValues: cFormValues,
        isMaxLoading: false,
      })
    },
    fetchRoutesAndOutput: async (config, curve, searchedParams, maxSlippage) => {
      const state = get()
      const sliceState = state[sliceKey]

      const activeKey = sliceState.activeKey
      const { chainId, signerAddress } = curve

      const cFormValues = cloneDeep(sliceState.formValues)
      const cFormStatus = cloneDeep(sliceState.formStatus)
      const tokensNameMapper = state.tokens.tokensNameMapper[chainId]

      if ((cFormValues.isFrom && +cFormValues.fromAmount <= 0) || (!cFormValues.isFrom && +cFormValues.toAmount <= 0))
        return

      if (!signerAddress) return // If no signer, routing handled via `useRouterApi`

      const poolsMapper = state.pools.poolsMapper[chainId]
      // allow UI to paint first
      await sleep(100)
      const { exchangeRates, ...resp } = await curvejsApi.router.routesAndOutput(
        activeKey,
        curve,
        poolsMapper,
        cFormValues,
        searchedParams,
      )

      if (resp.activeKey === get()[sliceKey].activeKey) {
        if (resp.error) {
          cFormStatus.error = resp.error
          get()[sliceKey].setStateByKey('formStatus', cFormStatus)
        } else {
          // update to/from form values
          if (cFormValues.isFrom) {
            cFormValues.toAmount = resp.toAmount
          } else {
            cFormValues.fromAmount = resp.fromAmount
          }

          const cActiveKey = getRouterActiveKey(curve, cFormValues, searchedParams, maxSlippage)
          cFormStatus.error = resp.routes.length === 0 ? 'error-swap-not-available' : ''

          sliceState.setStateByKeys({
            activeKey: cActiveKey,
            formValues: cloneDeep(cFormValues),
            formStatus: cFormStatus,
            routesAndOutput: {
              [cActiveKey]: {
                ...resp,
                provider: 'curve',
                loading: false,
                exchangeRates: getRouterSwapsExchangeRates(exchangeRates, searchedParams, tokensNameMapper),
                fetchedToAmount: '',
                modal: getRouterWarningModal(
                  resp,
                  searchedParams,
                  maxSlippage,
                  tokensNameMapper,
                ) as RoutesAndOutputModal | null,
              },
            },
          })

          // validation
          const fromAmount = await fetchTokenBalance(config, {
            chainId: curve.chainId,
            userAddress: curve.signerAddress,
            tokenAddress: searchedParams.fromAddress as Address,
          })
          cFormValues.fromError = +cFormValues.fromAmount > +fromAmount ? 'too-much' : ''
          get()[sliceKey].setStateByKey('formValues', cFormValues)
        }
      }
    },
    fetchEstGasApproval: async (curve, searchedParams) => {
      const state = get()
      const sliceState = state[sliceKey]

      const activeKey = sliceState.activeKey
      const { signerAddress } = curve
      const { fromAmount } = sliceState.formValues
      const { fromAddress, toAddress } = searchedParams

      if (+fromAmount <= 0 || !signerAddress) return

      // api call
      const resp = await curvejsApi.router.estGasApproval(activeKey, curve, fromAddress, toAddress, fromAmount)

      // set estimate gas state
      sliceState.setStateByKey('formEstGas', { [activeKey]: { estimatedGas: resp.estimatedGas, loading: false } })

      // update form status
      const storedFormStatus = get()[sliceKey].formStatus

      if (storedFormStatus.formProcessing) return

      sliceState.setStateByKey('formStatus', {
        ...storedFormStatus,
        isApproved: resp.isApproved,
        error: storedFormStatus.error || resp.error,
      })
    },
    resetFormErrors: () => {
      const state = get()
      const sliceState = state[sliceKey]

      sliceState.setStateByKeys({
        formStatus: { ...sliceState.formStatus, error: '', swapError: '' },
        formValues: { ...sliceState.formValues, fromError: '' },
      })
    },
    setFormValues: async (
      config,
      curve,
      updatedFormValues,
      searchedParams,
      maxSlippage,
      isGetMaxFrom,
      isFullReset,
      isRefetch, // x
    ) => {
      const state = get()
      const sliceState = state[sliceKey]

      // stored values
      const storedFormStatus = sliceState.formStatus
      const storedFormValues = sliceState.formValues

      // update formStatus, form values, reset errors
      const cFormValues = cloneDeep(
        isRefetch
          ? storedFormValues
          : isFullReset
            ? { ...storedFormValues, isFrom: true, fromAmount: '', fromError: '' as const, toAmount: '' }
            : {
                ...storedFormValues,
                ...updatedFormValues,
                fromError: '' as const,
              },
      )

      const activeKey = getRouterActiveKey(curve, cFormValues, searchedParams, maxSlippage)
      const cFormStatus = cloneDeep(isRefetch ? { ...storedFormStatus, swapError: '' } : DEFAULT_FORM_STATUS)

      get()[sliceKey].setStateByKeys({
        activeKey,
        formValues: cloneDeep(cFormValues),
        formStatus: cloneDeep(cFormStatus),
      })

      if (!curve || !searchedParams.fromAddress || !searchedParams.toAddress) return

      // set loading
      const storedRoutesAndOutput = sliceState.routesAndOutput[activeKey]
      if (storedRoutesAndOutput) {
        sliceState.setStateByKey('routesAndOutput', { [activeKey]: { ...storedRoutesAndOutput, loading: true } })
      }

      // Refetch balances
      if (curve.signerAddress) {
        if (searchedParams.fromAddress) {
          await fetchTokenBalance(config, {
            chainId: curve.chainId,
            userAddress: curve.signerAddress,
            tokenAddress: searchedParams.fromAddress as Address,
          })
        }

        if (searchedParams.toAddress) {
          await fetchTokenBalance(config, {
            chainId: curve.chainId,
            userAddress: curve.signerAddress,
            tokenAddress: searchedParams.toAddress as Address,
          })
        }
      }

      // get max if MAX button is clicked
      if (isGetMaxFrom) await sliceState.fetchMaxAmount(config, curve, searchedParams, maxSlippage)

      // api calls
      await sliceState.fetchRoutesAndOutput(config, curve, searchedParams, maxSlippage)
      void sliceState.fetchEstGasApproval(curve, searchedParams)
    },

    // select token list
    setPoolListFormValues: (hideSmallPools) => {
      const storedPoolListFormValues = cloneDeep(get().poolList.formValues)
      storedPoolListFormValues.hideSmallPools = hideSmallPools
      get().poolList.setStateByKey('formValues', storedPoolListFormValues)
    },

    // steps
    fetchStepApprove: async (activeKey, config, curve, formValues, searchedParams, globalMaxSlippage) => {
      const state = get()
      const sliceState = state[sliceKey]

      const { provider } = useWallet.getState()
      if (!provider) return setMissingProvider(get()[sliceKey])

      sliceState.setStateByKey('formStatus', {
        ...sliceState.formStatus,
        formProcessing: true,
        swapError: '',
        step: 'APPROVAL',
      })

      const { fromAmount } = formValues
      const { fromAddress } = searchedParams

      const resp = await curvejsApi.router.swapApprove(activeKey, curve, provider, fromAddress, fromAmount)

      if (resp.activeKey === get()[sliceKey].activeKey) {
        const cFormStatus = cloneDeep(sliceState.formStatus)
        cFormStatus.formProcessing = false
        cFormStatus.step = ''
        cFormStatus.swapError = ''

        if (resp.error) {
          cFormStatus.swapError = resp.error
          sliceState.setStateByKey('formStatus', cFormStatus)
        } else {
          cFormStatus.formTypeCompleted = 'APPROVE'
          cFormStatus.isApproved = true
          sliceState.setStateByKey('formStatus', cFormStatus)

          // re-fetch est gas, approval, routes and output
          await sliceState.fetchRoutesAndOutput(config, curve, searchedParams, globalMaxSlippage)
          void sliceState.fetchEstGasApproval(curve, searchedParams)
        }

        return resp
      }
    },
    fetchStepSwap: async (activeKey, config, curve, formValues, searchedParams, maxSlippage) => {
      const state = get()
      const sliceState = state[sliceKey]

      const { provider } = useWallet.getState()
      if (!provider) return setMissingProvider(get()[sliceKey])

      get()[sliceKey].setStateByKey('formStatus', {
        ...get()[sliceKey].formStatus,
        formProcessing: true,
        swapError: '',
        step: 'SWAP',
      })

      const { chainId } = curve
      const { fromAmount } = formValues
      const { fromAddress, toAddress } = searchedParams

      const resp = await curvejsApi.router.swap(
        activeKey,
        curve,
        provider,
        fromAddress,
        fromAmount,
        toAddress,
        maxSlippage,
      )

      if (resp.activeKey === get()[sliceKey].activeKey) {
        const cFormStatus = cloneDeep(sliceState.formStatus)
        cFormStatus.formProcessing = false
        cFormStatus.step = ''
        cFormStatus.swapError = ''

        if (resp.error) {
          cFormStatus.swapError = resp.error
          sliceState.setStateByKey('formStatus', cFormStatus)
        } else {
          cFormStatus.formTypeCompleted = 'SWAP'

          const cFormValues = cloneDeep(formValues)
          cFormValues.fromAmount = ''
          cFormValues.toAmount = ''

          get()[sliceKey].setStateByKeys({
            activeKey: getRouterActiveKey(curve, cFormValues, searchedParams, maxSlippage),
            formEstGas: {},
            formValues: cloneDeep(cFormValues),
            formStatus: cFormStatus,
            routesAndOutput: {},
          })

          // cache swapped tokens
          void state.storeCache.setStateByActiveKey('routerFormValues', chainId.toString(), { fromAddress, toAddress })

          // Refetch balances
          await fetchTokenBalance(config, {
            chainId: curve.chainId,
            userAddress: curve.signerAddress,
            tokenAddress: fromAddress as Address,
          })

          await fetchTokenBalance(config, {
            chainId: curve.chainId,
            userAddress: curve.signerAddress,
            tokenAddress: toAddress as Address,
          })
        }

        return resp
      }
    },

    // slice helpers
    setStateByActiveKey: (key, activeKey, value) => {
      if (Object.keys(get()[sliceKey][key] as object).length > 30) {
        get().setAppStateByKey(sliceKey, key, { [activeKey]: value })
      } else {
        get().setAppStateByActiveKey(sliceKey, key, activeKey, value)
      }
    },
    setStateByKey: (key, value) => {
      get().setAppStateByKey(sliceKey, key, value)
    },
    setStateByKeys: (sliceState) => {
      get().setAppStateByKeys(sliceKey, sliceState)
    },
    resetState: () => {
      get().resetAppState(sliceKey, {
        ...DEFAULT_STATE,
        formValues: {
          ...get()[sliceKey].formValues,
          fromError: '',
        },
      })
    },
  },
})

function getRouterActiveKey(
  curve: CurveApi | null,
  { fromAmount }: FormValues,
  searchedParams: SearchedParams,
  maxSlippage: string | undefined,
) {
  const { chainId = '', signerAddress = '' } = curve ?? {}
  const { fromAddress, toAddress } = searchedParams

  const parsedSignerAddress = signerAddress.slice(0, 10)
  const parsedFromAddress = fromAddress ? fromAddress.slice(fromAddress.length - 4) : ''
  const parsedToAddress = toAddress ? toAddress.slice(toAddress.length - 4) : ''

  return `${chainId}-${parsedSignerAddress}-${parsedFromAddress}-${parsedToAddress}-${fromAmount}-${maxSlippage}`
}

export function getRouterSwapsExchangeRates(
  exchangeRates: string[],
  searchedParams: SearchedParams,
  tokensNameMapper: { [p: string]: string },
) {
  const fromToken = tokensNameMapper[searchedParams.fromAddress]
  const toToken = tokensNameMapper[searchedParams.toAddress]
  return [
    {
      from: fromToken,
      to: toToken,
      fromAddress: searchedParams.fromAddress,
      value: exchangeRates[0],
      label: `${fromToken}/${toToken}`,
    },
    {
      from: toToken,
      to: fromToken,
      fromAddress: searchedParams.toAddress,
      value: exchangeRates[1],
      label: `${toToken}/${fromToken}`,
    },
  ]
}

export function getRouterWarningModal(
  {
    isExchangeRateLow,
    priceImpact,
    toAmount,
    toAmountOutput,
    fromAmount,
    fetchedToAmount,
  }: Pick<
    RoutesAndOutput,
    'isExchangeRateLow' | 'priceImpact' | 'toAmount' | 'toAmountOutput' | 'fromAmount' | 'fetchedToAmount'
  >,
  { toAddress }: SearchedParams,
  maxSlippage: string,
  storedTokensNameMapper: { [address: string]: string },
) {
  const { isHighImpact, isExpectedToAmount } = getSlippageImpact({
    maxSlippage,
    toAmount,
    priceImpact,
    fetchedToAmount,
  })
  const parsedToAmount = isExpectedToAmount ? toAmountOutput : toAmount
  const swapModalProps = getSwapActionModalType(isHighImpact, isExchangeRateLow)
  const toToken = storedTokensNameMapper[toAddress] ?? ''
  const exchangeRate = (+parsedToAmount / +fromAmount).toString()
  const exchangeValues = { toAmount: parsedToAmount, toToken }
  const modalTypeObj = { ...exchangeValues, title: swapModalProps.title }
  const modalType = {
    lowExchangeRate: { ...modalTypeObj, lowExchangeRate: true as boolean, exchangeRate },
    priceImpact: { ...modalTypeObj, priceImpact: true as boolean, value: priceImpact },
    priceImpactLowExchangeRate: {
      ...modalTypeObj,
      priceImpactLowExchangeRate: true as boolean,
      value: priceImpact,
      exchangeRate,
    },
  } as const

  if (swapModalProps.type && swapModalProps.type in modalType) {
    return modalType[swapModalProps.type]
  }
  return null
}
