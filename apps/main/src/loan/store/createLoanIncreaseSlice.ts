import lodash from 'lodash'
import type { StoreApi } from 'zustand'
import { updateUserEventsApi } from '@/llamalend/llama.utils'
import { invalidateUserPrices } from '@/llamalend/queries/user-prices.query'
import type { FormStatus, FormValues } from '@/loan/components/PageMintMarket/LoanIncrease/types'
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
  maxRecv: { [activeKey: string]: string }
}

const sliceKey = 'loanIncrease'

export type LoanIncreaseSlice = {
  [sliceKey]: SliceState & {
    init(chainId: ChainId, llamma: Llamma): Promise<void>
    fetchEstGasApproval(activeKey: string, chainId: ChainId, llamma: Llamma, formValues: FormValues): Promise<void>
    fetchDetailInfo(activeKey: string, chainId: ChainId, llamma: Llamma, formValues: FormValues): Promise<void>
    fetchMaxRecv(chainId: ChainId, llamma: Llamma, formValues: FormValues): Promise<string>
    setFormValues(chainId: ChainId, llamma: Llamma, formValues: FormValues): Promise<void>

    // steps
    fetchStepApprove(
      activeKey: string,
      curve: LlamaApi,
      llamma: Llamma,
      formValues: FormValues,
    ): Promise<{ hashes: string[]; error: string } | undefined>
    fetchStepIncrease(
      activeKey: string,
      curve: LlamaApi,
      llamma: Llamma,
      formValues: FormValues,
    ): Promise<{ activeKey: string; error: string; hash: string } | undefined>

    // steps helper
    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

export const DEFAULT_FORM_STATUS: FormStatus = {
  ...FORM_STATUS,
  step: '',
}

export const DEFAULT_FORM_VALUES: FormValues = {
  collateral: '',
  collateralError: '',
  debt: '',
  debtError: '',
}

const DEFAULT_STATE: SliceState = {
  activeKey: '',
  detailInfo: {},
  formEstGas: {},
  formStatus: DEFAULT_FORM_STATUS,
  formValues: DEFAULT_FORM_VALUES,
  maxRecv: {},
}

export const createLoanIncrease = (_set: StoreApi<State>['setState'], get: StoreApi<State>['getState']) => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    init: async (chainId: ChainId, llamma: Llamma) => {
      void get()[sliceKey].fetchMaxRecv(chainId, llamma, DEFAULT_FORM_VALUES)
    },
    fetchEstGasApproval: async (activeKey: string, chainId: ChainId, llamma: Llamma, formValues: FormValues) => {
      const { collateral, debt } = formValues
      const estGasApprovalFn = networks[chainId].api.loanIncrease.estGasApproval
      const resp = await estGasApprovalFn(activeKey, llamma, collateral, debt)

      const updatedFormEstGas = { estimatedGas: resp.estimatedGas }
      get()[sliceKey].setStateByActiveKey('formEstGas', resp.activeKey, updatedFormEstGas)

      // update formStatus
      const clonedFormStatus = cloneDeep(get()[sliceKey].formStatus)
      clonedFormStatus.isApproved = resp.isApproved

      if (!clonedFormStatus.error) {
        clonedFormStatus.error = resp.error
      }
      get()[sliceKey].setStateByKey('formStatus', clonedFormStatus)
    },
    fetchDetailInfo: async (activeKey: string, chainId: ChainId, llamma: Llamma, formValues: FormValues) => {
      const { collateral, debt } = formValues
      const detailInfoFn = networks[chainId].api.loanIncrease.detailInfo
      const resp = await detailInfoFn(activeKey, llamma, collateral, debt)

      get()[sliceKey].setStateByActiveKey('detailInfo', resp.activeKey, { ...resp.resp, loading: false })
    },
    fetchMaxRecv: async (chainId: ChainId, llamma: Llamma, formValues: FormValues) => {
      const { collateral } = formValues
      const maxRecvFn = networks[chainId].api.loanIncrease.maxRecv
      const resp = await maxRecvFn(llamma, collateral)
      const maxRecvActiveKey = getMaxRecvActiveKey(llamma, collateral)
      const parsedMaxRecv = +resp.maxRecv < 0 ? '0' : resp.maxRecv

      get()[sliceKey].setStateByActiveKey('maxRecv', maxRecvActiveKey, parsedMaxRecv)

      return parsedMaxRecv
    },
    setFormValues: async (chainId: ChainId, llamma: Llamma, formValues: FormValues) => {
      // stored values
      const prevActiveKey = get()[sliceKey].activeKey
      const storedFormEstGas = get()[sliceKey].formEstGas
      const storedDetailInfo = get()[sliceKey].detailInfo

      const cFormValues = cloneDeep(formValues)
      const activeKey = getLoanIncreaseActiveKey(llamma, cFormValues)
      const { collateral, debt } = formValues
      const haveCollateral = +collateral > 0
      const haveDebt = +debt > 0

      // validate collateral
      const collateralBalance = get().loans.userWalletBalancesMapper[llamma.id]?.collateral ?? '0'
      cFormValues.collateralError = +collateral > +collateralBalance ? 'too-much' : ''

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

      const maxRecv = await get()[sliceKey].fetchMaxRecv(chainId, llamma, cFormValues)

      //  validate debt
      if (haveDebt) {
        cFormValues.debtError = +debt > +maxRecv ? 'too-much' : ''
        get()[sliceKey].setStateByKey('formValues', cFormValues)
      }

      // fetch detail, approval, est gas, set loading
      if (haveDebt || haveCollateral) {
        void get()[sliceKey].fetchDetailInfo(activeKey, chainId, llamma, cFormValues)

        if (!cFormValues.debtError && !cFormValues.collateralError && !cFormValues.debtError) {
          void get()[sliceKey].fetchEstGasApproval(activeKey, chainId, llamma, cFormValues)
        }
      } else if (!haveDebt || !haveCollateral) {
        get()[sliceKey].setStateByActiveKey('detailInfo', activeKey, DEFAULT_DETAIL_INFO)
      }

      if (cFormValues.debtError || cFormValues.collateralError || cFormValues.debtError) {
        get()[sliceKey].setStateByActiveKey('formEstGas', activeKey, DEFAULT_FORM_EST_GAS)
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
      const { collateral } = formValues
      const approveFn = networks[chainId].api.loanIncrease.approve
      const resp = await approveFn(activeKey, provider, llamma, collateral)
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
    fetchStepIncrease: async (activeKey: string, curve: LlamaApi, llamma: Llamma, formValues: FormValues) => {
      const { provider, wallet } = useWallet.getState()
      if (!provider || !wallet) return setMissingProvider(get()[sliceKey])

      get()[sliceKey].setStateByKey('formStatus', {
        ...get()[sliceKey].formStatus,
        isInProgress: true,
        step: 'BORROW',
      })
      const chainId = curve.chainId as ChainId
      const { collateral, debt } = formValues
      const borrowMoreFn = networks[chainId].api.loanIncrease.borrowMore

      // re-fetch max
      const resp = await borrowMoreFn(activeKey, provider, llamma, collateral, debt)
      updateUserEventsApi(wallet, networks[chainId], llamma, resp.hash)
      void get()[sliceKey].fetchMaxRecv(chainId, llamma, formValues)

      // re-fetch loan info
      const { loanExists } = await get().loans.fetchLoanDetails(curve, llamma)
      if (!loanExists) {
        get().loans.resetUserDetailsState(llamma)
      }
      // invalidate user prices to keep ohlc chart liquidation range in sync
      await invalidateUserPrices({ chainId, marketId: llamma.id, userAddress: wallet?.address, loanExists: loanExists })

      if (activeKey === get()[sliceKey].activeKey) {
        get()[sliceKey].setStateByKeys({
          detailInfo: {},
          formEstGas: {},
          maxRecv: {},
          formStatus: {
            ...get()[sliceKey].formStatus,
            error: resp.error,
            isInProgress: false,
            isComplete: !resp.error,
            step: '',
          },
          formValues: DEFAULT_FORM_VALUES,
        })

        return resp
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

export function getLoanIncreaseActiveKey(llamma: Llamma, { collateral, debt }: FormValues) {
  return `${llamma.id}-${collateral}-${debt}`
}

export function getMaxRecvActiveKey(llamma: Llamma, collateral: string) {
  return `${llamma.id}-${collateral}`
}
