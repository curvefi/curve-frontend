import lodash from 'lodash'
import type { StoreApi } from 'zustand'
import { updateUserEventsApi } from '@/llamalend/llama.utils'
import { invalidateUserPrices } from '@/llamalend/queries/user-prices.query'
import type { FormStatus, FormValues } from '@/loan/components/PageMintMarket/LoanDecrease/types'
import type { FormDetailInfo, FormEstGas } from '@/loan/components/PageMintMarket/types'
import {
  DEFAULT_DETAIL_INFO,
  DEFAULT_FORM_EST_GAS,
  DEFAULT_FORM_STATUS as FORM_STATUS,
} from '@/loan/components/PageMintMarket/utils'
import { networks } from '@/loan/networks'
import type { State } from '@/loan/store/useStore'
import { ChainId, LlamaApi, Llamma } from '@/loan/types/loan.types'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { setMissingProvider } from '@ui-kit/utils/store.util'
import { loadingLRPrices } from '../lib/apiCrvusd'

type StateKey = keyof typeof DEFAULT_STATE
const { cloneDeep } = lodash

type SliceState = {
  activeKey: string
  detailInfo: { [activeKey: string]: FormDetailInfo }
  formEstGas: { [activeKey: string]: FormEstGas }
  formStatus: FormStatus
  formValues: FormValues
}

const sliceKey = 'loanDecrease'

export type LoanDecreaseSlice = {
  [sliceKey]: SliceState & {
    fetchEstGasApproval(activeKey: string, chainId: ChainId, llamma: Llamma, formValues: FormValues): Promise<void>
    fetchDetailInfo(activeKey: string, chainId: ChainId, llamma: Llamma, formValues: FormValues): Promise<void>
    setFormValues(chainId: ChainId, llamma: Llamma, formValues: FormValues): Promise<void>

    // step
    fetchStepApprove(
      activeKey: string,
      curve: LlamaApi,
      llamma: Llamma,
      formValues: FormValues,
    ): Promise<{ hashes: string[]; activeKey: string; error: string } | undefined>
    fetchStepDecrease(
      activeKey: string,
      curve: LlamaApi,
      llamma: Llamma,
      formValues: FormValues,
    ): Promise<{ activeKey: string; error: string; hash: string; loanExists: boolean } | undefined>

    // steps helper
    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

export const DEFAULT_FORM_STATUS: FormStatus = {
  ...FORM_STATUS,
  warning: '',
  step: '',
}

export const DEFAULT_FORM_VALUES: FormValues = {
  debt: '',
  debtError: '',
  isFullRepay: false,
}

const DEFAULT_STATE: SliceState = {
  activeKey: '',
  detailInfo: {},
  formEstGas: {},
  formStatus: DEFAULT_FORM_STATUS,
  formValues: DEFAULT_FORM_VALUES,
}

export const createLoanDecrease = (_set: StoreApi<State>['setState'], get: StoreApi<State>['getState']) => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchEstGasApproval: async (activeKey: string, chainId: ChainId, llamma: Llamma, formValues: FormValues) => {
      const { debt, isFullRepay } = formValues
      const estGasApprovalFn = networks[chainId].api.loanDecrease.estGasApproval
      const resp = await estGasApprovalFn(activeKey, llamma, debt, isFullRepay)

      get()[sliceKey].setStateByActiveKey('formEstGas', resp.activeKey, { estimatedGas: resp.estimatedGas })

      // update formStatus
      const clonedFormStatus = cloneDeep(get()[sliceKey].formStatus)
      clonedFormStatus.isApproved = resp.isApproved

      if (!clonedFormStatus.error) {
        clonedFormStatus.error = resp.error
      }
      get()[sliceKey].setStateByKey('formStatus', clonedFormStatus)
    },
    fetchDetailInfo: async (activeKey: string, chainId: ChainId, llamma: Llamma, formValues: FormValues) => {
      const { debt } = formValues
      const detailInfoFn = networks[chainId].api.loanDecrease.detailInfo
      const resp = await detailInfoFn(activeKey, llamma, debt)
      get()[sliceKey].setStateByActiveKey('detailInfo', activeKey, resp.resp)
    },
    setFormValues: async (chainId: ChainId, llamma: Llamma, formValues: FormValues) => {
      // stored values
      const prevActiveKey = get()[sliceKey].activeKey
      const storedFormEstGas = get()[sliceKey].formEstGas
      const storedDetailInfo = get()[sliceKey].detailInfo

      const cFormValues = cloneDeep(formValues)
      const { debt, isFullRepay } = formValues
      const activeKey = getLoanDecreaseActiveKey(llamma, debt, isFullRepay)

      if (isFullRepay) {
        const loadingFormEstGas = storedFormEstGas[activeKey] ??
          storedFormEstGas[prevActiveKey] ?? { ...DEFAULT_FORM_EST_GAS, loading: true }

        get()[sliceKey].setStateByActiveKey('formEstGas', activeKey, loadingFormEstGas)
        get()[sliceKey].setStateByKeys({ activeKey, formValues: cloneDeep(cFormValues) })

        void get()[sliceKey].fetchEstGasApproval(activeKey, chainId, llamma, cFormValues)
      } else {
        // validate debt
        const haveDebt = +debt > 0
        const userState = get().loans.userDetailsMapper[llamma.id]?.userState
        const userWalletBalances = get().loans.userWalletBalancesMapper[llamma.id]
        const isValidDebt = haveDebt && +userState?.debt > 0

        cFormValues.debtError = ''
        if (+debt > +userState?.debt) {
          cFormValues.debtError = 'too-much'
        } else if (+debt > +userWalletBalances?.stablecoin) {
          cFormValues.debtError = 'not-enough'
        }

        const loadingFormEstGas = storedFormEstGas[activeKey] ??
          storedFormEstGas[prevActiveKey] ?? { ...DEFAULT_FORM_EST_GAS, loading: true }

        const loadingDetailInfo = cloneDeep(
          storedDetailInfo[activeKey] ?? storedDetailInfo[prevActiveKey] ?? DEFAULT_DETAIL_INFO,
        )
        const parsedPrices = loadingLRPrices(loadingDetailInfo.prices)
        if (parsedPrices) loadingDetailInfo.prices = parsedPrices
        loadingDetailInfo.loading = true

        get()[sliceKey].setStateByActiveKey('formEstGas', activeKey, loadingFormEstGas)
        get()[sliceKey].setStateByActiveKey('detailInfo', activeKey, loadingDetailInfo)
        get()[sliceKey].setStateByKeys({ activeKey, formValues: cloneDeep(cFormValues) })

        // fetch approval, estimate gas and detail info
        if (isValidDebt && !cFormValues.debtError) {
          // do not fetch endpoint if payoff amount is same as input
          const isMaxPayable = +debt === +userState.debt
          const clonedFormStatus = cloneDeep(get()[sliceKey].formStatus)
          clonedFormStatus.warning = isMaxPayable ? 'warning-is-payoff-amount' : ''
          get()[sliceKey].setStateByKey('formStatus', clonedFormStatus)

          void (isMaxPayable
            ? get()[sliceKey].setStateByActiveKey('detailInfo', activeKey, DEFAULT_DETAIL_INFO)
            : get()[sliceKey].fetchDetailInfo(activeKey, chainId, llamma, cFormValues))

          void get()[sliceKey].fetchEstGasApproval(activeKey, chainId, llamma, cFormValues)
        } else if (!haveDebt || cFormValues.debtError) {
          get()[sliceKey].setStateByActiveKey('detailInfo', activeKey, DEFAULT_DETAIL_INFO)
          get()[sliceKey].setStateByActiveKey('formEstGas', activeKey, DEFAULT_FORM_EST_GAS)
          get()[sliceKey].setStateByKey('formStatus', { ...get()[sliceKey].formStatus, error: '' })
        }
      }
    },

    // steps
    fetchStepApprove: async (activeKey: string, curve: LlamaApi, llamma: Llamma, formValues: FormValues) => {
      const { provider } = useWallet.getState()
      if (!provider) return setMissingProvider(get()[sliceKey])

      get()[sliceKey].setStateByKey('formStatus', {
        ...get()[sliceKey].formStatus,
        isInProgress: true,
        step: 'APPROVAL',
      })

      const chainId = curve.chainId as ChainId
      const { debt, isFullRepay } = formValues
      const approveFn = networks[chainId].api.loanDecrease.approve
      const resp = await approveFn(activeKey, provider, llamma, debt, isFullRepay)
      if (activeKey === get()[sliceKey].activeKey) {
        get()[sliceKey].setStateByKey('formStatus', {
          ...get()[sliceKey].formStatus,
          isApproved: !resp.error,
          step: '',
          formProcessing: !resp.error,
          error: resp.error,
        })
        void get()[sliceKey].fetchEstGasApproval(activeKey, chainId, llamma, formValues)

        return resp
      }
    },
    fetchStepDecrease: async (activeKey: string, curve: LlamaApi, llamma: Llamma, formValues: FormValues) => {
      const { provider, wallet } = useWallet.getState()
      if (!provider || !wallet) return setMissingProvider(get()[sliceKey])

      get()[sliceKey].setStateByKey('formStatus', {
        ...get()[sliceKey].formStatus,
        isInProgress: true,
        step: 'PAY',
      })
      const chainId = curve.chainId as ChainId
      const repayFn = networks[chainId].api.loanDecrease.repay
      const resp = await repayFn(activeKey, provider, llamma, formValues.debt, formValues.isFullRepay)
      updateUserEventsApi(wallet, networks[chainId], llamma, resp.hash)

      if (activeKey === get()[sliceKey].activeKey) {
        // re-fetch loan info
        const { loanExists } = await get().loans.fetchLoanDetails(curve, llamma)

        if (!loanExists) {
          get().loans.resetUserDetailsState(llamma)
        }

        // invalidate user prices to keep ohlc chart liquidation range in sync
        await invalidateUserPrices({
          chainId,
          marketId: llamma.id,
          userAddress: wallet?.address,
          loanExists: loanExists,
        })

        get()[sliceKey].setStateByKey('formStatus', {
          ...get()[sliceKey].formStatus,
          error: resp.error,
          isInProgress: false,
          isComplete: resp.error ? '' : true,
          step: '',
        })

        get()[sliceKey].setStateByKeys({
          detailInfo: {},
          formEstGas: {},
          formValues: DEFAULT_FORM_VALUES,
        })

        return { ...resp, loanExists }
      }
    },

    // slice helpers
    setStateByActiveKey: <T>(key: StateKey, activeKey: string, value: T) => {
      get().setAppStateByActiveKey(sliceKey, key, activeKey, value)
    },
    setStateByKey: <T>(key: StateKey, value: T) => {
      get().setAppStateByKey(sliceKey, key, value)
    },
    setStateByKeys: (sliceState: Partial<SliceState>) => {
      get().setAppStateByKeys(sliceKey, sliceState)
    },
    resetState: () => {
      get().resetAppState(sliceKey, cloneDeep(DEFAULT_STATE))
    },
  },
})

export function getLoanDecreaseActiveKey(llamma: Llamma, debt: string, isFullRepay: boolean) {
  return `${llamma.collateralSymbol}-${debt}-${isFullRepay}`
}
