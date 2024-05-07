import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type {
  FormEstGas,
  FormStatus,
  FormValues,
  RoutesAndOutput,
  RoutesAndOutputModal,
  SearchedParams,
} from '@/components/PageRouterSwap/types'

import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import orderBy from 'lodash/orderBy'

import { DEFAULT_FORM_STATUS, DEFAULT_FORM_VALUES, sortTokensByGasFees } from '@/components/PageRouterSwap/utils'
import { NETWORK_TOKEN } from '@/constants'
import { getMaxAmountMinusGas } from '@/utils/utilsGasPrices'
import { getSwapActionModalType } from '@/utils/utilsSwap'
import { getChainSignerActiveKey, sleep } from '@/utils'
import curvejsApi from '@/lib/curvejs'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  activeKey: string
  formEstGas: { [activeKey: string]: FormEstGas }
  formStatus: FormStatus
  formValues: FormValues
  isMaxLoading: boolean
  routesAndOutput: { [activeKey: string]: RoutesAndOutput }
  selectToList: { [chainId: string]: string[] | undefined } //sorted by pool's volume and hideSmallPools
  selectFromList: { [chainSignerActiveKey: string]: string[] | undefined }
}

const sliceKey = 'quickSwap'

// prettier-ignore
export type QuickSwapSlice = {
  [sliceKey]: SliceState & {
    fetchUserBalances(curve: CurveApi, fromAddress: string, toAddress: string): Promise<{ fromAmount: string; toAmount: string }>
    fetchUsdRates(curve: CurveApi, searchedParams: SearchedParams): Promise<void>
    fetchMaxAmount(curve: CurveApi, searchedParams: SearchedParams, maxSlippage: string | undefined): Promise<void>
    fetchRoutesAndOutput(curve: CurveApi, searchedParams: SearchedParams, maxSlippage: string | undefined): Promise<void>
    fetchEstGasApproval(curve: CurveApi, searchedParams: SearchedParams): Promise<void>
    resetFormErrors(): void
    setFormValues(curve: CurveApi | null, updatedFormValues: Partial<FormValues>, searchedParams: SearchedParams, isGetMaxFrom?: boolean, maxSlippage?: string, isFullReset?: boolean, isRefetch?: boolean): Promise<void>

    // select token list
    setPoolListFormValues(hideSmallPools: boolean): void
    setSelectToList(curve: CurveApi | null, tokensMapper: TokensMapper): void
    setSelectFromList(curve: CurveApi | null, selectToList: string[] | undefined): Promise<void>

    // steps
    fetchStepApprove(activeKey: string, curve: CurveApi, formValues: FormValues, searchedParams: SearchedParams, globalMaxSlippage: string): Promise<FnStepApproveResponse | undefined>
    fetchStepSwap(activeKey: string, curve: CurveApi, formValues: FormValues, searchedParams: SearchedParams, maxSlippage: string): Promise<FnStepResponse & { swappedAmount: string; } | undefined>

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
  selectToList: {},
  selectFromList: {},
}

const createQuickSwapSlice = (set: SetState<State>, get: GetState<State>): QuickSwapSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchUserBalances: async (curve, fromAddress, toAddress) => {
      const { userBalancesMapper, fetchUserBalancesByTokens } = get().userBalances

      let fetchTokensList = []
      if (fromAddress && typeof userBalancesMapper[fromAddress] === 'undefined') fetchTokensList.push(fromAddress)
      if (toAddress && typeof userBalancesMapper[toAddress] === 'undefined') fetchTokensList.push(toAddress)

      if (fetchTokensList.length > 0) await fetchUserBalancesByTokens(curve, fetchTokensList)

      return {
        fromAmount: get().userBalances.userBalancesMapper[fromAddress] ?? '0',
        toAmount: get().userBalances.userBalancesMapper[toAddress] ?? '0',
      }
    },
    fetchUsdRates: async (curve, { fromAddress, toAddress }) => {
      const usdRateMapper = get().usdRates.usdRatesMapper

      if (typeof usdRateMapper[toAddress] === 'undefined' || typeof usdRateMapper[fromAddress] === 'undefined') {
        await get().usdRates.fetchUsdRateByTokens(curve, [fromAddress, toAddress])
      }
    },
    fetchMaxAmount: async (curve, searchedParams, maxSlippage) => {
      const state = get()
      const sliceState = state[sliceKey]

      let activeKey = sliceState.activeKey
      const { chainId, signerAddress } = curve
      const { fromAddress, toAddress } = searchedParams

      const cFormValues = cloneDeep(sliceState.formValues)

      if (signerAddress) {
        const userBalance = state.userBalances.userBalancesMapper[fromAddress] ?? '0'

        cFormValues.fromAmount = userBalance
        activeKey = getRouterActiveKey(curve, cFormValues, searchedParams, maxSlippage)

        // get max amount for native token
        if (fromAddress.toLowerCase() === NETWORK_TOKEN) {
          await state.gas.fetchGasInfo(curve)
          const { basePlusPriority } = get().gas.gasInfo ?? {}
          const firstBasePlusPriority = basePlusPriority?.[0]

          if (typeof firstBasePlusPriority !== 'undefined' && +userBalance > 0) {
            sliceState.setStateByKey('isMaxLoading', true)
            // must call routesAndOutput first before estGas
            const poolsMapper = state.pools.poolsMapper[chainId]
            await curvejsApi.router.routesAndOutput(
              activeKey,
              curve,
              poolsMapper,
              cFormValues,
              searchedParams,
              maxSlippage
            )

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
    fetchRoutesAndOutput: async (curve, searchedParams, maxSlippage) => {
      const state = get()
      const sliceState = state[sliceKey]

      const activeKey = sliceState.activeKey
      const { chainId, signerAddress } = curve

      const cFormValues = cloneDeep(sliceState.formValues)
      const cFormStatus = cloneDeep(sliceState.formStatus)
      const tokensNameMapper = state.tokens.tokensNameMapper[chainId]

      if ((cFormValues.isFrom && +cFormValues.fromAmount <= 0) || (!cFormValues.isFrom && +cFormValues.toAmount <= 0))
        return

      // loading state
      if (cFormValues.isFrom) {
        cFormValues.toAmount = ''
      } else {
        cFormValues.fromAmount = ''
      }
      sliceState.setStateByKey('formValues', cloneDeep(cFormValues))

      const poolsMapper = state.pools.poolsMapper[chainId]
      // allow UI to paint first
      await sleep(100)
      const { exchangeRates, ...resp } = await curvejsApi.router.routesAndOutput(
        activeKey,
        curve,
        poolsMapper,
        cFormValues,
        searchedParams,
        maxSlippage
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
                loading: false,
                exchangeRates: getRouterSwapsExchangeRates(
                  exchangeRates,
                  cFormValues,
                  searchedParams,
                  tokensNameMapper
                ),
                modal: getRouterWarningModal(resp, searchedParams, tokensNameMapper) as RoutesAndOutputModal | null,
              },
            },
          })

          if (!signerAddress) return

          // validation
          const { fromAmount } = await sliceState.fetchUserBalances(curve, searchedParams.fromAddress, '')
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
      const { fromAmount, isFrom, toAmount } = sliceState.formValues
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
      curve,
      updatedFormValues,
      searchedParams,
      isGetMaxFrom,
      maxSlippage,
      isFullReset,
      isRefetch // x
    ) => {
      const state = get()
      const sliceState = state[sliceKey]

      // stored values
      const storedFormStatus = sliceState.formStatus
      const storedFormValues = sliceState.formValues
      const storedUserBalancesMapper = state.userBalances.userBalancesMapper

      // update formStatus, form values, reset errors
      let cFormValues = cloneDeep(
        isRefetch
          ? storedFormValues
          : isFullReset
          ? { ...storedFormValues, isFrom: true, fromAmount: '', fromError: '' as const, toAmount: '' }
          : {
              ...storedFormValues,
              ...updatedFormValues,
              fromError: '' as const,
            }
      )

      let activeKey = getRouterActiveKey(curve, cFormValues, searchedParams, maxSlippage)
      let cFormStatus = cloneDeep(isRefetch ? { ...storedFormStatus, swapError: '' } : DEFAULT_FORM_STATUS)

      get()[sliceKey].setStateByKeys({
        activeKey,
        formValues: cloneDeep(cFormValues),
        formStatus: cloneDeep(cFormStatus),
      })

      if (!curve || !storedUserBalancesMapper || !searchedParams.fromAddress || !searchedParams.toAddress) return

      const { signerAddress } = curve

      // set loading
      const storedRoutesAndOutput = sliceState.routesAndOutput[activeKey]
      if (storedRoutesAndOutput) {
        sliceState.setStateByKey('routesAndOutput', { [activeKey]: { ...storedRoutesAndOutput, loading: true } })
      }

      // get wallet balances
      if (signerAddress) await sliceState.fetchUserBalances(curve, searchedParams.fromAddress, searchedParams.toAddress)

      // get max if MAX button is clicked
      if (isGetMaxFrom) await sliceState.fetchMaxAmount(curve, searchedParams, maxSlippage)

      // get usdRates
      await sliceState.fetchUsdRates(curve, searchedParams)

      // api calls
      await sliceState.fetchRoutesAndOutput(curve, searchedParams, maxSlippage)
      sliceState.fetchEstGasApproval(curve, searchedParams)
    },

    // select token list
    setPoolListFormValues: (hideSmallPools) => {
      const storedPoolListFormValues = cloneDeep(get().poolList.formValues)
      storedPoolListFormValues.hideSmallPools = hideSmallPools
      get().poolList.setStateByKey('formValues', storedPoolListFormValues)
    },
    setSelectFromList: async (curve, selectToList) => {
      const state = get()
      const sliceState = state[sliceKey]

      if (!curve || !selectToList || (selectToList && selectToList.length === 0)) return

      const { chainId, signerAddress } = curve

      if (!signerAddress) return

      const chainSignerActiveKey = getChainSignerActiveKey(chainId, signerAddress)
      const storedSelectFromList = sliceState.selectFromList[chainSignerActiveKey]

      // get user balances
      await state.userBalances.fetchUserBalancesByTokens(curve, selectToList)
      const userBalancesMapper = get().userBalances.userBalancesMapper
      const filteredUserBalancesList = Object.keys(userBalancesMapper).filter(
        (k) => +(userBalancesMapper[k] ?? '0') > 0
      )

      // get usd rates
      await state.usdRates.fetchUsdRateByTokens(curve, [...filteredUserBalancesList, NETWORK_TOKEN])
      const usdRatesMapper = get().usdRates.usdRatesMapper

      // get gas
      if (typeof state.gas.gasInfo?.basePlusPriority?.[0] === 'undefined') await state.gas.fetchGasInfo(curve)
      const firstBasePlusPriority = get().gas.gasInfo?.basePlusPriority?.[0] ?? 0

      // sort list
      const selectFromList = sortTokensByGasFees(
        userBalancesMapper,
        usdRatesMapper,
        selectToList,
        firstBasePlusPriority
      )

      const isSame = isEqual(storedSelectFromList, selectFromList)

      if (!isSame) sliceState.setStateByKey('selectFromList', { [chainSignerActiveKey]: selectFromList })
    },
    setSelectToList: (curve, tokensMapper) => {
      const state = get()
      const sliceState = state[sliceKey]

      if (!curve || Object.keys(tokensMapper).length === 0) return

      const { chainId, signerAddress } = curve

      const selectToList = orderBy(
        Object.entries(tokensMapper).map(([_, v]) => v!),
        ({ volume }) => (typeof volume !== 'undefined' ? +volume : 0),
        ['desc']
      ).map(({ address }) => address)

      sliceState.setStateByActiveKey('selectToList', chainId.toString(), selectToList)

      if (signerAddress) sliceState.setSelectFromList(curve, selectToList)
    },

    // steps
    fetchStepApprove: async (activeKey, curve, formValues, searchedParams, globalMaxSlippage) => {
      const state = get()
      const sliceState = state[sliceKey]

      const provider = state.wallet.getProvider(sliceKey)

      if (!provider) return

      sliceState.setStateByKey('formStatus', {
        ...sliceState.formStatus,
        formProcessing: true,
        swapError: '',
        step: 'APPROVAL',
      })

      const { fromAmount } = formValues
      const { fromAddress } = searchedParams

      await state.gas.fetchGasInfo(curve)
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
          await sliceState.fetchRoutesAndOutput(curve, searchedParams, globalMaxSlippage)
          sliceState.fetchEstGasApproval(curve, searchedParams)
        }

        return resp
      }
    },
    fetchStepSwap: async (activeKey, curve, formValues, searchedParams, maxSlippage) => {
      const state = get()
      const sliceState = state[sliceKey]

      const provider = state.wallet.getProvider(sliceKey)

      if (!provider) return

      get()[sliceKey].setStateByKey('formStatus', {
        ...get()[sliceKey].formStatus,
        formProcessing: true,
        swapError: '',
        step: 'SWAP',
      })

      const { chainId } = curve
      const { fromAmount } = formValues
      const { fromAddress, toAddress } = searchedParams

      await state.gas.fetchGasInfo(curve)
      const resp = await curvejsApi.router.swap(
        activeKey,
        curve,
        provider,
        fromAddress,
        fromAmount,
        toAddress,
        maxSlippage
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
          state.storeCache.setStateByActiveKey('routerFormValues', chainId.toString(), { fromAddress, toAddress })

          // fetch data
          state.userBalances.fetchUserBalancesByTokens(curve, [fromAddress, toAddress])
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
  maxSlippage: string | undefined
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
  formValues: FormValues,
  searchedParams: SearchedParams,
  tokensNameMapper: { [address: string]: string }
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

function getRouterWarningModal(
  {
    isHighImpact,
    isExpectedToAmount,
    isExchangeRateLow,
    priceImpact,
    toAmount,
    toAmountOutput,
    fromAmount,
  }: Pick<
    RoutesAndOutput,
    | 'isHighImpact'
    | 'isExchangeRateLow'
    | 'isExpectedToAmount'
    | 'priceImpact'
    | 'toAmount'
    | 'toAmountOutput'
    | 'fromAmount'
  >,
  { toAddress }: SearchedParams,
  storedTokensNameMapper: { [address: string]: string }
) {
  const toToken = storedTokensNameMapper[toAddress] ?? ''
  const parsedToAmount = isExpectedToAmount ? toAmountOutput : toAmount
  const swapModalProps = getSwapActionModalType(isHighImpact, isExchangeRateLow)
  const exchangeRate = (+parsedToAmount / +fromAmount).toString()
  const exchangeValues = { toAmount: parsedToAmount, toToken }
  let modalTypeObj = { ...exchangeValues, title: swapModalProps.title }
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

export function getTokensObjList(tokensList: string[] | undefined, tokensMapper: TokensMapper | undefined) {
  if (!tokensList || tokensList.length === 0 || !tokensMapper || Object.keys(tokensMapper).length === 0) return []
  return tokensList.map((address) => tokensMapper[address])
}

export default createQuickSwapSlice
