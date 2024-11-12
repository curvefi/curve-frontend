import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type { EstimatedGas as FormEstGas } from '@/components/PagePool/types'
import type { ExchangeOutput, RouterSwapOutput, FormStatus, FormValues } from '@/components/PagePool/Swap/types'
import type { RoutesAndOutput, RoutesAndOutputModal } from '@/components/PageRouterSwap/types'

import cloneDeep from 'lodash/cloneDeep'
import { Contract, Interface, JsonRpcProvider } from 'ethers'

import {
  DEFAULT_EST_GAS,
  DEFAULT_EXCHANGE_OUTPUT,
  DEFAULT_FORM_STATUS,
  DEFAULT_FORM_VALUES,
} from '@/components/PagePool/Swap/utils'
import { NETWORK_TOKEN } from '@/constants'
import { getMaxAmountMinusGas } from '@/utils/utilsGasPrices'
import { getSwapActionModalType } from '@/utils/utilsSwap'
import curvejsApi from '@/lib/curvejs'
import networks from '@/networks'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  activeKey: string
  exchangeOutput: { [activeKey: string]: ExchangeOutput }
  routerSwapOutput: { [activeKey: string]: RouterSwapOutput }
  isMaxLoading: boolean
  ignoreExchangeRateCheck: { [poolId: string]: boolean }
  formEstGas: { [activeKey: string]: FormEstGas }
  formStatus: FormStatus
  formValues: FormValues
}

const sliceKey = 'poolSwap'

// prettier-ignore
export type PoolSwapSlice = {
  [sliceKey]: SliceState & {
    fetchIgnoreExchangeRateCheck(curve: CurveApi, pool: Pool): Promise<boolean>
    fetchExchangeOutput(activeKey: string, storedActiveKey: string, curve: CurveApi, pool: Pool, formValues: FormValues, maxSlippage: string): Promise<void>
    fetchTokenWalletBalance(curve: CurveApi, poolId: string, tokenAddress: string): Promise<Balances>
    fetchMaxAmount(activeKey: string, curve: CurveApi, pool: Pool, formValues: FormValues, maxSlippage: string): Promise<string>
    setFormValues(curve: CurveApi | null, poolId: string, poolData: PoolData | undefined, updatedFormValues: Partial<FormValues>, isGetMaxFrom: boolean | null, isSeed: boolean | null, maxSlippage: string): Promise<void>

    // steps
    fetchEstGasApproval(activeKey: string, chainId: ChainId, pool: Pool, formValues: FormValues, maxSlippage: string): Promise<FnStepEstGasApprovalResponse | undefined>
    fetchStepApprove(activeKey: string, curve: CurveApi, pool: Pool, formValues: FormValues, globalMaxSlippage: string): Promise<FnStepApproveResponse | undefined>
    fetchStepSwap(activeKey: string, curve: CurveApi, poolData: PoolData, formValues: FormValues, maxSlippage: string): Promise<FnStepResponse | undefined>

    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(poolData: PoolData): void
  }
}

const DEFAULT_STATE: SliceState = {
  activeKey: '',
  exchangeOutput: {},
  routerSwapOutput: {},
  isMaxLoading: false,
  ignoreExchangeRateCheck: {},
  formEstGas: {},
  formStatus: DEFAULT_FORM_STATUS,
  formValues: DEFAULT_FORM_VALUES,
}

const createPoolSwapSlice = (set: SetState<State>, get: GetState<State>): PoolSwapSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchIgnoreExchangeRateCheck: async (curve: CurveApi, pool: Pool) => {
      const state = get()
      const sliceState = state[sliceKey]

      const { chainId } = curve

      const storedIgnoreExchangeRateCheck = sliceState.ignoreExchangeRateCheck[pool.id]

      if (typeof storedIgnoreExchangeRateCheck !== 'undefined') {
        return storedIgnoreExchangeRateCheck
      } else {
        const provider = state.wallet.getProvider('') || new JsonRpcProvider(networks[chainId].rpcUrl)

        if (!provider) return false

        try {
          const json = await import('@/components/PagePool/abis/stored_rates.json').then((module) => module.default)
          const iface = new Interface(json)
          const contract = new Contract(pool.address, iface.format(), provider)
          const storedRates = await contract.stored_rates()

          const ignoreExchangeRateCheck = Object.values(storedRates).some((rate) => {
            // if rate is > 1, then number cannot be checked for exchange rate
            const parsedRate = BigInt(rate as bigint)
              .toString()
              .replace(/0+$/, '')
            return Number(parsedRate) > 1
          })
          sliceState.setStateByActiveKey('ignoreExchangeRateCheck', pool.id, ignoreExchangeRateCheck)
          return ignoreExchangeRateCheck
        } catch (error) {
          // ignore error, only stablswap ng pools have stored_rates
          sliceState.setStateByActiveKey('ignoreExchangeRateCheck', pool.id, false)
          return false
        }
      }
    },
    fetchExchangeOutput: async (activeKey, storedActiveKey: string, curve, pool, formValues, maxSlippage) => {
      const state = get()
      const sliceState = state[sliceKey]

      const ignoreExchangeRateCheck = await sliceState.fetchIgnoreExchangeRateCheck(curve, pool)
      const resp = await curvejsApi.poolSwap.exchangeOutput(
        activeKey,
        pool,
        formValues,
        maxSlippage,
        ignoreExchangeRateCheck,
      )

      const cFormStatus = cloneDeep(sliceState.formStatus)
      cFormStatus.error = ''
      cFormStatus.warning = ''

      if (resp.error) {
        get()[sliceKey].setStateByKey('formStatus', { ...cFormStatus, error: resp.error })
      } else {
        let cFormValues = cloneDeep(formValues)
        cFormValues.toAmount = resp.toAmount
        cFormValues.fromAmount = resp.fromAmount
        let activeKey = getActiveKey(cFormValues, maxSlippage)

        sliceState.setStateByKeys({
          activeKey,
          formValues: cloneDeep(cFormValues),
          formStatus: {
            ...cFormStatus,
            warning: resp.isExchangeRateLow ? 'warning-exchange-rate-low' : '',
          },
          exchangeOutput: {
            [activeKey]: {
              ...resp,
              loading: false,
              modal: getRouterWarningModal(resp, cFormValues) as RoutesAndOutputModal | null,
            },
          },
        })

        if (curve.signerAddress) {
          // validate fromAmount
          const userPoolBalances = await get().poolDeposit.fetchUserPoolWalletBalances(curve, pool.id)
          const userFromBalance = userPoolBalances[cFormValues.fromAddress]
          cFormValues.fromError = +userFromBalance >= +cFormValues.fromAmount ? '' : 'too-much'

          // update formValues
          get()[sliceKey].setStateByKey('formValues', cloneDeep(cFormValues))

          // get est gas, approval
          if (!cFormValues.fromError) {
            get()[sliceKey].setStateByActiveKey('formEstGas', activeKey, {
              ...(get()[sliceKey].formEstGas[storedActiveKey] ?? DEFAULT_EST_GAS),
              loading: true,
            })
            get()[sliceKey].fetchEstGasApproval(activeKey, curve.chainId, pool, cFormValues, maxSlippage)
          }
        }

        // TODO: add feature to also check router swap
        // const poolsMapper = get().pools.poolsMapper[curve.chainId]
        // const routesAndOutputFn = curvejsApi.router.routesAndOutput
        // const {
        //   activeKey: routerSwapRespActiveKey,
        //   exchangeRates: routerSwapRespExchangeRates,
        //   ...routerSwapResp
        // } = await routesAndOutputFn(activeKey, curve, poolsMapper, cFormValues, maxSlippage)
        //
        // if (+routerSwapResp.toAmount > +cFormValues.toAmount) {
        //   let isApproved = null
        //   if (curve.signerAddress) {
        //     const estGasApprovalFn = curvejsApi.router.estGasApproval
        //     const resp = await estGasApprovalFn(
        //       activeKey,
        //       curve,
        //       cFormValues.fromAddress,
        //       cFormValues.toAddress,
        //       cFormValues.fromAmount
        //     )
        //     isApproved = resp.isApproved
        //   }
        //   get()[sliceKey].setStateByKey('routerSwapOutput', {
        //     [routerSwapRespActiveKey]: {
        //       ...routerSwapResp,
        //       exchangeRates: getRouterSwapsExchangeRates(routerSwapRespExchangeRates, cFormValues),
        //       isApproved,
        //     },
        //   })
        // }
      }
    },
    fetchTokenWalletBalance: async (curve: CurveApi, poolId: string, tokenAddress: string) => {
      const storedWalletBalance = get().user.walletBalances[tokenAddress]
      return storedWalletBalance ?? (await get().user.fetchUserPoolInfo(curve, poolId, true))
    },
    fetchMaxAmount: async (
      activeKey: string,
      curve: CurveApi,
      pool: Pool,
      formValues: FormValues,
      maxSlippage: string,
    ) => {
      // stored values
      const userPoolBalances = await get()[sliceKey].fetchTokenWalletBalance(curve, pool.id, formValues.fromAddress)
      const walletFromBalance = userPoolBalances[formValues.fromAddress]
      const { basePlusPriority } = get().gas.gasInfo ?? {}

      let fromAmount = walletFromBalance ?? '0'

      // get max amount for native token
      if (
        formValues.fromAddress.toLowerCase() === NETWORK_TOKEN &&
        typeof basePlusPriority?.[0] !== 'undefined' &&
        +fromAmount > 0
      ) {
        get()[sliceKey].setStateByKey('isMaxLoading', true)
        const resp = await curvejsApi.poolSwap.estGasApproval(
          activeKey,
          curve.chainId,
          pool,
          formValues.isWrapped,
          formValues.toAddress,
          formValues.fromAddress,
          fromAmount,
          maxSlippage,
        )

        if (resp.estimatedGas) {
          fromAmount = getMaxAmountMinusGas(resp.estimatedGas, basePlusPriority[0], walletFromBalance)
        }
        get()[sliceKey].setStateByKey('isMaxLoading', false)
      }

      return fromAmount
    },
    setFormValues: async (curve, poolId, poolData, updatedFormValues, isGetMaxFrom, isSeed, maxSlippage) => {
      // stored values
      const storedActiveKey = get()[sliceKey].activeKey
      const storedFormStatus = get()[sliceKey].formStatus
      const storedFormValues = get()[sliceKey].formValues

      // update form values
      let cFormValues = cloneDeep({ ...storedFormValues, ...updatedFormValues })
      cFormValues.toError = ''
      cFormValues.fromError = ''

      let activeKey = getActiveKey(cFormValues, maxSlippage)
      get()[sliceKey].setStateByKeys({
        activeKey,
        formStatus: { ...DEFAULT_FORM_STATUS, isApproved: storedFormStatus.isApproved },
        formValues: cloneDeep(cFormValues),
      })

      if (
        !curve ||
        !poolData ||
        isSeed === null ||
        !cFormValues.fromToken ||
        !cFormValues.fromAddress ||
        !cFormValues.toToken ||
        !cFormValues.toAddress ||
        cFormValues.isWrapped === null
      )
        return

      const pool = poolData.pool

      // get max fromAmount
      if (isGetMaxFrom) {
        cFormValues.fromAmount = await get()[sliceKey].fetchMaxAmount(activeKey, curve, pool, cFormValues, maxSlippage)
        activeKey = getActiveKey(cFormValues, maxSlippage)
        get()[sliceKey].setStateByKeys({ activeKey, formValues: cloneDeep(cFormValues) })
      }

      if (!(+cFormValues.toAmount > 0 || +cFormValues.fromAmount > 0)) return

      // validate toAmount: If have toAmount and isFrom is false, confirm toAmount is not bigger than currency reserves
      if (+cFormValues.toAmount > 0 && !cFormValues.isFrom) {
        const { currencyReserves, fetchPoolCurrenciesReserves } = get().pools
        const currencyReserve = currencyReserves[poolId] ?? (await fetchPoolCurrenciesReserves(curve, poolData))

        if (Array.isArray(currencyReserve?.tokens)) {
          cFormValues.toError = getReservesBalanceError(currencyReserve, cFormValues.toAddress, cFormValues.toAmount)
          get()[sliceKey].setStateByKey('formValues', cloneDeep(cFormValues))
        }
      }

      if (cFormValues.toError) return

      // get exchange rate info
      get()[sliceKey].setStateByActiveKey(
        'exchangeOutput',
        activeKey,
        cloneDeep({ ...DEFAULT_EXCHANGE_OUTPUT, loading: true }),
      )
      get()[sliceKey].fetchExchangeOutput(activeKey, storedActiveKey, curve, pool, cFormValues, maxSlippage)
    },

    // steps
    fetchEstGasApproval: async (activeKey, chainId, pool, formValues, maxSlippage) => {
      const { fromAddress, toAddress, fromAmount, isWrapped } = formValues
      const resp = await curvejsApi.poolSwap.estGasApproval(
        activeKey,
        chainId,
        pool,
        isWrapped,
        fromAddress,
        toAddress,
        fromAmount,
        maxSlippage,
      )

      // set estimate gas state
      get()[sliceKey].setStateByActiveKey('formEstGas', activeKey, { estimatedGas: resp.estimatedGas, loading: false })

      // set form status
      const storedFormStatus = get()[sliceKey].formStatus
      if (!storedFormStatus.formProcessing) {
        get()[sliceKey].setStateByKey('formStatus', {
          ...get()[sliceKey].formStatus,
          isApproved: resp.isApproved,
          error: storedFormStatus.error || resp.error,
        })
      }
      return resp
    },
    fetchStepApprove: async (activeKey, curve, pool, formValues, maxSlippage) => {
      const provider = get().wallet.getProvider(sliceKey)

      if (provider) {
        const storedActiveKey = get()[sliceKey].activeKey

        get()[sliceKey].setStateByKey('formStatus', {
          ...get()[sliceKey].formStatus,
          formProcessing: true,
          step: 'APPROVAL',
        })

        await get().gas.fetchGasInfo(curve)
        const { fromAddress, fromAmount, isWrapped } = formValues
        const resp = await curvejsApi.poolSwap.swapApprove(
          activeKey,
          provider,
          pool,
          isWrapped,
          fromAddress,
          fromAmount,
        )

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

            // fetch est gas, approval and exchange
            get()[sliceKey].fetchEstGasApproval(activeKey, curve.chainId, pool, formValues, maxSlippage)
            await get()[sliceKey].fetchExchangeOutput(activeKey, storedActiveKey, curve, pool, formValues, maxSlippage)
          }

          return resp
        }
      }
    },
    fetchStepSwap: async (activeKey, curve, poolData, formValues, maxSlippage) => {
      const provider = get().wallet.getProvider(sliceKey)

      if (provider) {
        get()[sliceKey].setStateByKey('formStatus', {
          ...get()[sliceKey].formStatus,
          formProcessing: true,
          step: 'SWAP',
        })

        await get().gas.fetchGasInfo(curve)
        const { fromAddress, fromToken, fromAmount, toAddress, toToken, isWrapped } = formValues
        const resp = await curvejsApi.poolSwap.swap(
          activeKey,
          provider,
          poolData.pool,
          isWrapped,
          fromAddress,
          toAddress,
          fromAmount,
          maxSlippage,
        )

        if (resp.activeKey === get()[sliceKey].activeKey) {
          const cFormStatus = cloneDeep(get()[sliceKey].formStatus)
          cFormStatus.formProcessing = false
          cFormStatus.step = ''
          cFormStatus.error = ''

          if (resp.error) {
            cFormStatus.error = resp.error
            get()[sliceKey].setStateByKey('formStatus', cFormStatus)
          } else {
            const cFormValues = cloneDeep(formValues)
            cFormValues.fromAmount = ''
            cFormValues.toAmount = ''

            cFormStatus.formTypeCompleted = 'SWAP'

            get()[sliceKey].setStateByKeys({
              formStatus: cFormStatus,
              activeKey: getActiveKey(cFormValues, maxSlippage),
              exchangeOutput: {},
              formEstGas: {},
              formValues: cFormValues,
            })

            // cache swapped tokens
            get().storeCache.setStateByActiveKey('routerFormValues', curve.chainId.toString(), {
              fromAddress,
              fromToken,
              toAddress,
              toToken,
            })

            // re-fetch data
            await Promise.all([
              get().user.fetchUserPoolInfo(curve, poolData.pool.id, true),
              get().pools.fetchPoolStats(curve, poolData),
            ])
          }
          return resp
        }
      }
    },

    // slice helpers
    setStateByActiveKey: <T>(key: StateKey, activeKey: string, value: T) => {
      if (Object.keys(get()[sliceKey][key]).length > 30) {
        get().setAppStateByKey(sliceKey, key, { [activeKey]: value })
      } else {
        get().setAppStateByActiveKey(sliceKey, key, activeKey, value)
      }
    },
    setStateByKey: <T>(key: StateKey, value: T) => {
      get().setAppStateByKey(sliceKey, key, value)
    },
    setStateByKeys: <T>(sliceState: Partial<SliceState>) => {
      get().setAppStateByKeys(sliceKey, sliceState)
    },
    resetState: ({ tokens, tokenAddresses, isWrapped }) => {
      get().resetAppState(sliceKey, {
        ...DEFAULT_STATE,
        formValues: {
          ...DEFAULT_FORM_VALUES,
          isWrapped,
          fromToken: tokens[0],
          fromAddress: tokenAddresses[0],
          toToken: tokens[1],
          toAddress: tokenAddresses[1],
        },
      })
    },
  },
})

function getRouterWarningModal(
  {
    isHighImpact,
    isExchangeRateLow,
    priceImpact,
    toAmount,
    fromAmount,
  }: Pick<RoutesAndOutput, 'isHighImpact' | 'isExchangeRateLow' | 'priceImpact' | 'toAmount' | 'fromAmount'>,
  { toToken }: FormValues,
) {
  const swapModalProps = getSwapActionModalType(isHighImpact, isExchangeRateLow)
  const exchangeRate = (+toAmount / +fromAmount).toString()
  const exchangeValues = { toAmount, toToken }
  const modalType = {
    lowExchangeRate: {
      lowExchangeRate: true,
      title: swapModalProps.title,
      exchangeRate,
      ...exchangeValues,
    },
    priceImpact: {
      priceImpact: true,
      title: swapModalProps.title,
      value: priceImpact,
      ...exchangeValues,
    },
    priceImpactLowExchangeRate: {
      priceImpactLowExchangeRate: true,
      title: swapModalProps.title,
      value: priceImpact,
      exchangeRate,
      ...exchangeValues,
    },
  } as const

  if (swapModalProps.type && swapModalProps.type in modalType) {
    return modalType[swapModalProps.type]
  }
  return null
}

function getReservesBalanceError(currencyReserves: CurrencyReserves, address: string, amount: string) {
  if (+amount > 0) {
    const found = currencyReserves.tokens.find((t) => t.tokenAddress === address)
    return found ? (+amount > 0 && +amount > +found.balance ? 'too-much-reserves' : '') : ''
  }
  return ''
}

export function getActiveKey({ fromAddress, fromAmount, toAmount, toAddress }: FormValues, maxSlippage: string) {
  const parsedFromAddress = fromAddress ? fromAddress.slice(fromAddress.length - 4) : ''
  const parsedToAddress = toAddress ? toAddress.slice(toAddress.length - 4) : ''
  return `${parsedFromAddress}-${fromAmount}-${parsedToAddress}-${maxSlippage}`
}

export default createPoolSwapSlice
