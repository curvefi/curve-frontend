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
import type { FormStatusWarning } from '@/components/PageRouterSwap/types'

import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import isUndefined from 'lodash/isUndefined'
import orderBy from 'lodash/orderBy'

import {
  DEFAULT_EST_GAS,
  DEFAULT_FORM_STATUS,
  DEFAULT_FORM_VALUES,
  DEFAULT_ROUTES_AND_OUTPUT,
  getUserTokensMapper,
  sortTokensByGasFees,
} from '@/components/PageRouterSwap/utils'
import { NETWORK_TOKEN } from '@/constants'
import { getMaxAmountMinusGas } from '@/utils/utilsGasPrices'
import { getSwapActionModalType } from '@/utils/utilsSwap'
import { getChainSignerActiveKey, sleep } from '@/utils'
import networks from '@/networks'

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
    fetchMaxAmount(activeKey: string, curve: CurveApi, searchedParams: SearchedParams, fromWalletBalance: string): Promise<string>
    fetchUserBalance(curve: CurveApi, tokenAddress: string): Promise<string>
    fetchRoutesAndOutput( activeKey: string, curve: CurveApi, formValues: FormValues, searchedParams: SearchedParams, formStatus: FormStatus, maxSlippage: string, tokensNameMapper: TokensNameMapper): Promise<void>
    setFormValues(updatedFormValues: Partial<FormValues>, searchedParams: SearchedParams, pageLoaded: boolean, curve: CurveApi | null, isGetMaxFrom: boolean, maxSlippage: string, isFullReset: boolean, tokensNameMapper: TokensNameMapper): Promise<void>
    setSelectToList(pageLoaded: boolean, curve: CurveApi, tokensMapper: TokensMapper, volumesMapper: VolumeMapper): void
    setSelectFromList(pageLoaded: boolean, curve: CurveApi, selectToList: string[], firstBasePlusPriority: number | undefined, usdRatesMapper: UsdRatesMapper, userBalancesMapper: UserBalancesMapper): Promise<void>
    fetchEstGasApproval(activeKey: string, curve: CurveApi, formValues: FormValues, formStatus: FormStatus, searchedParams: SearchedParams): Promise<FnStepEstGasApprovalResponse>
    fetchStepApprove(activeKey: string, curve: CurveApi, formValues: FormValues, searchedParams: SearchedParams,  globalMaxSlippage: string, tokensNameMapper: TokensNameMapper): Promise<FnStepApproveResponse | undefined>
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

    fetchUserBalance: async (curve, tokenAddress) => {
      const { userBalancesMapper, fetchUserBalancesByTokens } = get().userBalances
      return (
        userBalancesMapper[tokenAddress] ?? (await fetchUserBalancesByTokens(curve, [tokenAddress]))[tokenAddress] ?? ''
      )
    },
    fetchRoutesAndOutput: async (
      activeKey,
      curve,
      formValues,
      searchedParams,
      formStatus,
      maxSlippage,
      tokensNameMapper
    ) => {
      const { chainId, signerAddress } = curve

      // allow UI to paint first
      await sleep(100)
      const poolsMapper = get().pools.poolsMapper[chainId]
      const routesAndOutputFn = networks[chainId].api.router.routesAndOutput
      const { exchangeRates, ...resp } = await routesAndOutputFn(
        activeKey,
        curve,
        poolsMapper,
        formValues,
        searchedParams,
        maxSlippage
      )

      if (resp.activeKey === get()[sliceKey].activeKey) {
        const cFormStatus = cloneDeep(formStatus)
        if (resp.error) {
          cFormStatus.error = resp.error
          get()[sliceKey].setStateByActiveKey('routesAndOutput', activeKey, cloneDeep(DEFAULT_ROUTES_AND_OUTPUT))
          get()[sliceKey].setStateByKey('formStatus', cFormStatus)
        } else {
          // update to/from form values
          let cActiveKey
          let cFormValues = cloneDeep(formValues)

          if (formValues.isFrom) {
            cFormValues.toAmount = resp.toAmount
          } else {
            cFormValues.fromAmount = resp.fromAmount
          }
          cActiveKey = getRouterActiveKey(cFormValues, searchedParams, maxSlippage)

          let warning: FormStatusWarning = ''
          if (resp.isExchangeRateLow && resp.isExpectedToAmount) {
            warning = 'warning-exchange-rate-low-is-expected-to-amount'
          } else if (resp.isExchangeRateLow) {
            warning = 'warning-is-expected-to-amount'
          }

          cFormStatus.error = resp.routes.length === 0 ? 'error-swap-not-available' : cFormStatus.error
          cFormStatus.warning = warning

          get()[sliceKey].setStateByKeys({
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

          if (signerAddress) {
            // validate fromAmount
            const walletFromBalance = await get()[sliceKey].fetchUserBalance(curve, searchedParams.fromAddress)
            cFormValues.fromError = +cFormValues.fromAmount > +walletFromBalance ? 'too-much' : ''
            get()[sliceKey].setStateByKey('formValues', cloneDeep(cFormValues))

            // get est. gas
            if (!cFormValues.fromError) {
              const cFormEstGas = cloneDeep(get()[sliceKey].formEstGas[activeKey] ?? DEFAULT_EST_GAS)
              cFormEstGas.loading = true
              get()[sliceKey].setStateByKey('formEstGas', { [cActiveKey]: cloneDeep(cFormEstGas) })
              get()[sliceKey].fetchEstGasApproval(cActiveKey, curve, cFormValues, cFormStatus, searchedParams)
            }
          }
        }
      }
    },
    fetchMaxAmount: async (activeKey, curve, searchedParams, formWalletBalance) => {
      // stored values
      const { basePlusPriority } = get().gas.gasInfo ?? {}
      let fromAmount = formWalletBalance ?? '0'

      // get max amount for native token
      if (
        searchedParams.fromAddress.toLowerCase() === NETWORK_TOKEN &&
        typeof basePlusPriority?.[0] !== 'undefined' &&
        +fromAmount > 0
      ) {
        get()[sliceKey].setStateByKey('isMaxLoading', true)
        const estGasApprovalFn = networks[curve.chainId].api.router.estGasApproval
        const resp = await estGasApprovalFn(
          activeKey,
          curve,
          searchedParams.fromAddress,
          searchedParams.toAddress,
          fromAmount
        )

        if (resp.estimatedGas) {
          fromAmount = getMaxAmountMinusGas(resp.estimatedGas, basePlusPriority[0], formWalletBalance)
        }
        get()[sliceKey].setStateByKey('isMaxLoading', false)
      }

      return fromAmount
    },
    setSelectFromList: async (
      pageLoaded,
      curve,
      selectToList,
      firstBasePlusPriority,
      usdRatesMapper,
      userBalancesMapper
    ) => {
      const haveUsdRates = Object.keys(usdRatesMapper).length > 0
      const haveUserBalancesMapper = Object.keys(userBalancesMapper).length > 0

      if (!pageLoaded || !curve || !selectToList?.length || !haveUsdRates || !haveUserBalancesMapper) return
      const { chainId, signerAddress } = curve
      const chainSignerActiveKey = getChainSignerActiveKey(chainId, signerAddress)
      const userTokensMapper = getUserTokensMapper(
        curve,
        selectToList,
        usdRatesMapper,
        userBalancesMapper,
        get().usdRates.fetchUsdRateByTokens
      )

      // sort user tokens list
      if (Object.keys(userTokensMapper).length) {
        const storedFromTokens = get()[sliceKey].selectFromList[chainSignerActiveKey]
        const networkTokenUsdRate = usdRatesMapper[NETWORK_TOKEN]

        const selectFromList = sortTokensByGasFees(
          userTokensMapper,
          selectToList,
          firstBasePlusPriority,
          networkTokenUsdRate
        )
        const isSame = isEqual(storedFromTokens, selectFromList)

        if (!isSame) {
          get()[sliceKey].setStateByKey('selectFromList', { [chainSignerActiveKey]: cloneDeep(selectFromList) })
        }
      }
    },
    setSelectToList: (pageLoaded, curve, tokensMapper) => {
      if (!pageLoaded || !curve || Object.keys(tokensMapper).length === 0) return

      const { chainId } = curve

      const selectToList = orderBy(
        Object.entries(tokensMapper).map(([_, v]) => v!),
        ({ address, volume }) => (typeof volume !== 'undefined' ? +volume : 0),
        ['desc']
      ).map(({ address }) => address)

      get()[sliceKey].setStateByActiveKey('selectToList', chainId.toString(), cloneDeep(selectToList))
      get().storeCache.setStateByActiveKey('routerSelectToList', chainId.toString(), cloneDeep(selectToList))
    },
    setFormValues: async (
      updatedFormValues,
      searchedParams,
      pageLoaded,
      curve,
      isGetMaxFrom,
      maxSlippage,
      isFullReset,
      tokensNameMapper
    ) => {
      // stored values
      const storedActiveKey = get()[sliceKey].activeKey
      const storedRoutesAndOutput = get()[sliceKey].routesAndOutput[storedActiveKey] ?? DEFAULT_ROUTES_AND_OUTPUT
      const storedFormStatus = get()[sliceKey].formStatus
      const storedFormValues = get()[sliceKey].formValues
      const storedUserBalancesMapper = get().userBalances.userBalancesMapper
      const storedUsdRatesMapper = get().usdRates.usdRatesMapper

      // update formStatus, form values, reset errors
      let cFormValues = cloneDeep({
        ...storedFormValues,
        ...(isFullReset ? { isFrom: true, fromAmount: '', toAmount: '' } : updatedFormValues),
        fromError: '',
      })
      if (cFormValues.isFrom) cFormValues.toAmount = ''
      if (!cFormValues.isFrom) cFormValues.fromAmount = ''

      let activeKey = getRouterActiveKey(cFormValues, searchedParams, maxSlippage)

      let cFormStatus = cloneDeep(isFullReset ? DEFAULT_FORM_STATUS : storedFormStatus)
      cFormStatus.error = ''
      cFormStatus.warning = ''
      cFormStatus.formTypeCompleted = ''
      let cRoutesAndOutputs = isFullReset ? DEFAULT_ROUTES_AND_OUTPUT : storedRoutesAndOutput

      get()[sliceKey].setStateByKeys({
        activeKey,
        formValues: cloneDeep(cFormValues),
        formStatus: cloneDeep(cFormStatus),
        formEstGas: { [activeKey]: cloneDeep(DEFAULT_EST_GAS) },
        routesAndOutput: {
          [activeKey]: cloneDeep({
            ...cRoutesAndOutputs,
            loading:
              !!searchedParams.fromAddress &&
              !!searchedParams.toAddress &&
              (+cFormValues.fromAmount > 0 || +cFormValues.toAmount > 0),
          }),
        },
      })

      if (
        !pageLoaded ||
        !curve ||
        !storedUserBalancesMapper ||
        !searchedParams.fromAddress ||
        !searchedParams.toAddress
      )
        return

      const { chainId, signerAddress } = curve
      let fromWalletBalance = storedUserBalancesMapper[searchedParams.fromAddress] ?? ''

      // get wallet balances
      if (!!signerAddress) {
        if (
          isUndefined(storedUserBalancesMapper[searchedParams.fromAddress]) ||
          isUndefined(storedUserBalancesMapper[searchedParams.toAddress])
        ) {
          const resp = await get().userBalances.fetchUserBalancesByTokens(curve, [
            searchedParams.fromAddress,
            searchedParams.toAddress,
          ])
          fromWalletBalance = resp[searchedParams.fromAddress] ?? ''
        }

        // check spending approval
        if (+fromWalletBalance > 0) {
          const fn = networks[chainId].api.router.estGasApproval
          const resp = await fn(
            activeKey,
            curve,
            searchedParams.fromAddress,
            searchedParams.toAddress,
            fromWalletBalance,
            true
          )

          cFormStatus.isApproved = resp.isApproved
          get()[sliceKey].setStateByKey('formStatus', cloneDeep(cFormStatus))
        }
      }

      // get max if MAX button is clicked
      if (isGetMaxFrom) {
        if (!!signerAddress) {
          cFormValues.fromAmount = await get()[sliceKey].fetchMaxAmount(
            activeKey,
            curve,
            searchedParams,
            fromWalletBalance
          )
        } else {
          cFormValues.fromAmount = '0'
        }
        activeKey = getRouterActiveKey(cFormValues, searchedParams, maxSlippage)
        get()[sliceKey].setStateByKeys({ activeKey, formValues: cloneDeep(cFormValues) })
      }

      // validate from amount
      cFormValues.fromError = !!signerAddress
        ? +cFormValues.fromAmount > +fromWalletBalance
          ? 'too-much'
          : cFormValues.fromError
        : ''
      get()[sliceKey].setStateByKeys({ activeKey, formValues: cloneDeep(cFormValues) })

      // get usdRates
      if (
        isUndefined(storedUsdRatesMapper[searchedParams.toAddress]) ||
        isUndefined(storedUsdRatesMapper[searchedParams.fromAddress])
      ) {
        get().usdRates.fetchUsdRateByTokens(curve, [searchedParams.fromAddress, searchedParams.toAddress])
      }

      // get routes and outputs
      if ((cFormValues.isFrom && +cFormValues.fromAmount > 0) || (!cFormValues.isFrom && +cFormValues.toAmount > 0)) {
        get()[sliceKey].fetchRoutesAndOutput(
          activeKey,
          curve,
          cFormValues,
          searchedParams,
          cFormStatus,
          maxSlippage,
          tokensNameMapper
        )
      } else {
        get()[sliceKey].setStateByKey('routesAndOutput', {
          [activeKey]: cloneDeep({ ...cRoutesAndOutputs, loading: false }),
        })
      }
    },

    // steps
    fetchEstGasApproval: async (activeKey, curve, formValues, formStatus, searchedParams) => {
      const { fromAmount } = formValues
      const { fromAddress, toAddress } = searchedParams
      const estGasApprovalFn = networks[curve.chainId].api.router.estGasApproval
      const resp = await estGasApprovalFn(activeKey, curve, fromAddress, toAddress, fromAmount)
      await get().gas.fetchGasInfo(curve)

      // set estimate gas state
      get()[sliceKey].setStateByKey('formEstGas', { [activeKey]: { estimatedGas: resp.estimatedGas, loading: false } })

      // update form status
      const storedFormStatus = get()[sliceKey].formStatus
      if (!storedFormStatus.formProcessing) {
        get()[sliceKey].setStateByKey('formStatus', {
          ...storedFormStatus,
          isApproved: resp.isApproved,
          error: storedFormStatus.error || resp.error,
        })
      }
      return resp
    },
    fetchStepApprove: async (activeKey, curve, formValues, searchedParams, globalMaxSlippage, tokensNameMapper) => {
      const provider = get().wallet.getProvider(sliceKey)

      if (provider) {
        get()[sliceKey].setStateByKey('formStatus', {
          ...get()[sliceKey].formStatus,
          formProcessing: true,
          step: 'APPROVAL',
        })

        await get().gas.fetchGasInfo(curve)
        const { chainId } = curve
        const { fromAmount } = formValues
        const { fromAddress } = searchedParams
        const swapApproveFn = networks[chainId].api.router.swapApprove
        const resp = await swapApproveFn(activeKey, curve, provider, fromAddress, fromAmount)

        if (resp.activeKey === get()[sliceKey].activeKey) {
          const cFormStatus = cloneDeep(get()[sliceKey].formStatus)
          cFormStatus.formProcessing = false
          cFormStatus.step = ''
          cFormStatus.error = ''

          if (resp.error) {
            cFormStatus.error = resp.error
            get()[sliceKey].setStateByKey('formStatus', cFormStatus)
          } else {
            cFormStatus.formTypeCompleted = 'APPROVE'
            cFormStatus.isApproved = true
            get()[sliceKey].setStateByKey('formStatus', cFormStatus)

            // re-fetch est gas, approval, routes and output
            await Promise.all([
              get()[sliceKey].fetchEstGasApproval(activeKey, curve, formValues, cFormStatus, searchedParams),
              get()[sliceKey].fetchRoutesAndOutput(
                activeKey,
                curve,
                formValues,
                searchedParams,
                cFormStatus,
                globalMaxSlippage,
                tokensNameMapper
              ),
            ])
          }
          return resp
        }
      }
    },
    fetchStepSwap: async (activeKey, curve, formValues, searchedParams, maxSlippage) => {
      const provider = get().wallet.getProvider(sliceKey)

      if (provider) {
        get()[sliceKey].setStateByKey('formStatus', {
          ...get()[sliceKey].formStatus,
          formProcessing: true,
          step: 'SWAP',
        })

        await get().gas.fetchGasInfo(curve)
        const { chainId } = curve
        const { fromAmount } = formValues
        const { fromAddress, toAddress } = searchedParams
        const swapFn = networks[chainId].api.router.swap
        const resp = await swapFn(activeKey, curve, provider, fromAddress, fromAmount, toAddress, maxSlippage)

        if (resp.activeKey === get()[sliceKey].activeKey) {
          const cFormStatus = cloneDeep(get()[sliceKey].formStatus)
          cFormStatus.formProcessing = false
          cFormStatus.step = ''
          cFormStatus.error = ''
          cFormStatus.warning = ''

          if (resp.error) {
            cFormStatus.error = resp.error
            get()[sliceKey].setStateByKey('formStatus', cFormStatus)
          } else {
            cFormStatus.formTypeCompleted = 'SWAP'

            const cFormValues = cloneDeep(formValues)
            cFormValues.fromAmount = ''
            cFormValues.toAmount = ''

            get()[sliceKey].setStateByKeys({
              activeKey: getRouterActiveKey(cFormValues, searchedParams, maxSlippage),
              formEstGas: {},
              formValues: cloneDeep(cFormValues),
              formStatus: cFormStatus,
              routesAndOutput: {},
            })

            // cache swapped tokens
            get().storeCache.setStateByActiveKey('routerFormValues', chainId.toString(), { fromAddress, toAddress })

            // fetch data
            get().userBalances.fetchUserBalancesByTokens(curve, [fromAddress, toAddress])
          }

          return resp
        }
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

function getRouterActiveKey({ fromAmount }: FormValues, searchedParams: SearchedParams, maxSlippage: string) {
  const { fromAddress, toAddress } = searchedParams
  const parsedFromAddress = fromAddress ? fromAddress.slice(fromAddress.length - 4) : ''
  const parsedToAddress = toAddress ? toAddress.slice(toAddress.length - 4) : ''
  return `${parsedFromAddress}-${parsedToAddress}-${fromAmount}-${maxSlippage}`
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
    isExchangeRateLow,
    priceImpact,
    toAmount,
    fromAmount,
  }: Pick<RoutesAndOutput, 'isHighImpact' | 'isExchangeRateLow' | 'priceImpact' | 'toAmount' | 'fromAmount'>,
  { toAddress }: SearchedParams,
  storedTokensNameMapper: { [address: string]: string }
) {
  const toToken = storedTokensNameMapper[toAddress] ?? ''
  const swapModalProps = getSwapActionModalType(isHighImpact, isExchangeRateLow)
  const exchangeRate = (+toAmount / +fromAmount).toString()
  const exchangeValues = { toAmount, toToken }
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

export function getTokensListStr(tokensList: string[] | undefined) {
  return (tokensList ?? []).reduce((str, address) => {
    str += address.charAt(5)
    return str
  }, '')
}

export function getTokensObjListStr(tokensList: (Token | undefined)[] | undefined) {
  return (tokensList ?? []).reduce((str, tokenObj) => {
    str += tokenObj?.address ? tokenObj.address.charAt(5) : ''
    return str
  }, '')
}

export function getTokensObjList(tokensList: string[] | undefined, tokensMapper: TokensMapper | undefined) {
  if (!tokensList || tokensList.length === 0 || !tokensMapper || Object.keys(tokensMapper).length === 0) return []
  return tokensList.map((address) => tokensMapper[address])
}

export default createQuickSwapSlice
