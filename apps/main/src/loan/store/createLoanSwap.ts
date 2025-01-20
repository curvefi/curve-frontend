import type { GetState, SetState } from 'zustand'
import type { State } from '@loan/store/useStore'
import type { FormEstGas } from '@loan/components/PageLoanManage/types'
import type { FormDetailInfo, FormStatus, FormValues } from '@loan/components/PageLoanManage/LoanSwap/types'

import { DEFAULT_FORM_EST_GAS, DEFAULT_FORM_STATUS as FORM_STATUS } from '@loan/components/PageLoanManage/utils'
import networks from '@loan/networks'
import cloneDeep from 'lodash/cloneDeep'
import { ChainId, Curve, Llamma } from '@loan/types/loan.types'
import { useWalletStore } from '@ui-kit/features/connect-wallet/store'
import { setMissingProvider } from '@ui-kit/features/connect-wallet'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  activeKey: string
  detailInfo: { [activeKey: string]: FormDetailInfo }
  formEstGas: { [activeKey: string]: FormEstGas }
  formStatus: FormStatus
  formValues: FormValues
  maxSwappableActiveKey: string
  maxSwappable: { [activeKey: string]: string }
}

const sliceKey = 'loanSwap'

export type LoanSwapSlice = {
  [sliceKey]: SliceState & {
    init(chainId: ChainId, llamma: Llamma): Promise<void>
    fetchEstGasApproval(
      activeKey: string,
      chainId: ChainId,
      llamma: Llamma,
      formValues: FormValues,
      amount: string,
      maxSlippage: string,
    ): Promise<void>
    fetchDetailInfo(
      activeKey: string,
      chainId: ChainId,
      llamma: Llamma,
      formValues: FormValues,
      maxSlippage: string,
    ): Promise<void>
    fetchMaxSwappable(chainId: ChainId, llamma: Llamma, formValues: FormValues): Promise<string>
    setFormValues(chainId: ChainId, llamma: Llamma, formValues: FormValues, maxSlippage: string): Promise<void>

    //steps
    fetchStepApprove(
      activeKey: string,
      curve: Curve,
      llamma: Llamma,
      formValues: FormValues,
      maxSlippage: string,
    ): Promise<{ hashes: string[]; activeKey: string; error: string } | undefined>
    fetchStepSwap(
      activeKey: string,
      curve: Curve,
      llamma: Llamma,
      formValues: FormValues,
      maxSlippage: string,
    ): Promise<{ activeKey: string; error: string; hash: string } | undefined>

    // steps helper
    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

export const DEFAULT_DETAIL_INFO: FormDetailInfo = {
  isExpected: null,
  amount: '',
  swapPriceImpact: '',
}

export const DEFAULT_FORM_STATUS: FormStatus = {
  ...FORM_STATUS,
  step: '',
}

// 0 = stablecoin, 1 = collateral
export const DEFAULT_FORM_VALUES: FormValues = {
  item1: '',
  item1Error: '',
  item1Key: '0',
  item2: '',
  item2Error: '',
  item2Key: '1',
}

export const itemKey = {
  '0': 'stablecoin',
  '1': 'collateral',
} as const

const DEFAULT_STATE: SliceState = {
  activeKey: '',
  detailInfo: {},
  formEstGas: {},
  formStatus: DEFAULT_FORM_STATUS,
  formValues: DEFAULT_FORM_VALUES,
  maxSwappableActiveKey: '',
  maxSwappable: {},
}

const createLoanSwap = (set: SetState<State>, get: GetState<State>) => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    init: async (chainId: ChainId, llamma: Llamma) => {
      const activeKey = getSwapActiveKey(llamma, DEFAULT_FORM_VALUES)
      get()[sliceKey].setStateByKey('activeKey', activeKey)
      get()[sliceKey].fetchMaxSwappable(chainId, llamma, DEFAULT_FORM_VALUES)
    },
    fetchEstGasApproval: async (
      activeKey: string,
      chainId: ChainId,
      llamma: Llamma,
      formValues: FormValues,
      amount: string,
      maxSlippage: string,
    ) => {
      const { item1Key, item2Key } = formValues
      const estGasApprovalFn = networks[chainId].api.swap.estGasApproval
      const resp = await estGasApprovalFn(activeKey, llamma, item1Key, item2Key, amount, maxSlippage)

      // update form est gas
      const formEstGas = { estimatedGas: resp.estimatedGas }
      get()[sliceKey].setStateByActiveKey('formEstGas', resp.activeKey, formEstGas)

      // update formStatus
      const clonedFormStatus = cloneDeep(get()[sliceKey].formStatus)
      clonedFormStatus.isApproved = resp.isApproved

      if (!clonedFormStatus.error) {
        clonedFormStatus.error = resp.error
      }
      get()[sliceKey].setStateByKey('formStatus', clonedFormStatus)
    },
    fetchDetailInfo: async (
      activeKey: string,
      chainId: ChainId,
      llamma: Llamma,
      formValues: FormValues,
      maxSlippage: string,
    ) => {
      const detailInfoFn = networks[chainId].api.swap.detailInfoExpected
      const { activeKey: fetchedActiveKey, resp } = await detailInfoFn(activeKey, llamma, formValues)

      get()[sliceKey].setStateByActiveKey('detailInfo', fetchedActiveKey, resp)

      // validate item1 if it was prefilled from Item2
      const haveItem2 = +formValues.item2 > 0
      if (haveItem2) {
        const maSwappableActiveKey = getMaxSwappableActiveKey(llamma, formValues)
        const maxSwappable = get()[sliceKey].maxSwappable[maSwappableActiveKey] ?? '0'
        const item1Error = +resp.amount > +maxSwappable ? 'too-much' : ''

        // fetch est gas
        if (!item1Error) {
          get()[sliceKey].fetchEstGasApproval(activeKey, chainId, llamma, formValues, resp.amount, maxSlippage)
        } else {
          get()[sliceKey].setStateByKey('formValues', { ...get()[sliceKey].formValues, item1Error })
          get()[sliceKey].fetchEstGasApproval(activeKey, chainId, llamma, formValues, resp.amount, maxSlippage)
        }
      }
    },

    fetchMaxSwappable: async (chainId: ChainId, llamma: Llamma, formValues: FormValues) => {
      const resp = await networks[chainId].api.swap.max(llamma, formValues)

      // max swappable value should either be itemKey's wallet balance or resp balance (pool balance)
      const userWalletBalances = get().loans.userWalletBalancesMapper[llamma.id]
      const walletBalance = userWalletBalances?.[itemKey[formValues.item1Key]]
      const parsedMaxSwappable = +walletBalance > +resp.maxSwappable ? resp.maxSwappable : walletBalance

      const maxSwappableActiveKey = getMaxSwappableActiveKey(llamma, formValues)
      get()[sliceKey].setStateByKey('maxSwappableActiveKey', maxSwappableActiveKey)
      get()[sliceKey].setStateByActiveKey('maxSwappable', maxSwappableActiveKey, parsedMaxSwappable)

      if (resp.error) {
        get()[sliceKey].setStateByKey('formStatus', { ...get()[sliceKey].formStatus, error: resp.error })
      }

      return parsedMaxSwappable
    },
    setFormValues: async (chainId: ChainId, llamma: Llamma, formValues: FormValues, maxSlippage: string) => {
      // stored values
      const prevActiveKey = get()[sliceKey].activeKey
      const storedFormEstGas = get()[sliceKey].formEstGas
      const storedDetailInfo = get()[sliceKey].detailInfo

      const cFormValues = cloneDeep(formValues)
      const activeKey = getSwapActiveKey(llamma, formValues)
      const { item1, item2 } = formValues
      const haveItem1 = +item1 > 0
      const haveItem2 = +item2 > 0

      const loadingFormEstGas = storedFormEstGas[activeKey] ??
        storedFormEstGas[prevActiveKey] ?? { ...DEFAULT_FORM_EST_GAS, loading: true }

      let loadingDetailInfo = cloneDeep(
        storedDetailInfo[activeKey] ?? storedDetailInfo[prevActiveKey] ?? DEFAULT_DETAIL_INFO,
      )
      loadingDetailInfo.loading = true

      get()[sliceKey].setStateByActiveKey('formEstGas', activeKey, loadingFormEstGas)
      get()[sliceKey].setStateByActiveKey('detailInfo', activeKey, loadingDetailInfo)
      get()[sliceKey].setStateByKeys({ activeKey, formValues: cloneDeep(cFormValues) })

      // validate item1
      const maxSwappableActiveKey = getMaxSwappableActiveKey(llamma, cFormValues)
      const storedMaxSwappable = get()[sliceKey].maxSwappable[maxSwappableActiveKey]
      const maxSwappable = storedMaxSwappable ?? (await get()[sliceKey].fetchMaxSwappable(chainId, llamma, cFormValues))
      const haveMaxSwappable = typeof maxSwappable !== 'undefined'
      cFormValues.item1Error = haveItem1 && haveMaxSwappable && +item1 > +maxSwappable ? 'too-much' : ''
      get()[sliceKey].setStateByKey('formValues', cloneDeep(cFormValues))

      // fetch approval, estimated gas and detail info
      if (haveItem1 || haveItem2) {
        if (haveItem1) {
          get()[sliceKey].fetchEstGasApproval(activeKey, chainId, llamma, cFormValues, item1, maxSlippage)
        }
        get()[sliceKey].fetchDetailInfo(activeKey, chainId, llamma, cFormValues, maxSlippage)
      } else if (!haveItem1) {
        get()[sliceKey].setStateByActiveKey('detailInfo', activeKey, DEFAULT_DETAIL_INFO)
        get()[sliceKey].setStateByActiveKey('formEstGas', activeKey, DEFAULT_FORM_EST_GAS)
        get()[sliceKey].setStateByKey('formStatus', { ...get()[sliceKey].formStatus, error: '' })
      }
    },

    // steps
    fetchStepApprove: async (
      activeKey: string,
      curve: Curve,
      llamma: Llamma,
      formValues: FormValues,
      maxSlippage: string,
    ) => {
      const { provider } = useWalletStore.getState()
      if (!provider) return setMissingProvider(get()[sliceKey])

      get()[sliceKey].setStateByKey('formStatus', {
        ...get()[sliceKey].formStatus,
        isInProgress: true,
        step: 'APPROVAL',
      })
      await get().gas.fetchGasInfo(curve)
      const chainId = curve.chainId
      const approveFn = networks[chainId].api.swap.approve
      const resp = await approveFn(activeKey, provider, llamma, formValues)
      if (activeKey === get()[sliceKey].activeKey) {
        get()[sliceKey].setStateByKey('formStatus', {
          ...get()[sliceKey].formStatus,
          isApproved: !resp.error,
          step: '',
          formProcessing: !resp.error,
          error: resp.error,
        })

        get()[sliceKey].fetchEstGasApproval(activeKey, chainId, llamma, formValues, formValues.item1, maxSlippage)

        return resp
      }
    },
    fetchStepSwap: async (
      activeKey: string,
      curve: Curve,
      llamma: Llamma,
      formValues: FormValues,
      maxSlippage: string,
    ) => {
      const { provider } = useWalletStore.getState()
      if (!provider) return setMissingProvider(get()[sliceKey])

      get()[sliceKey].setStateByKey('formStatus', {
        ...get()[sliceKey].formStatus,
        isInProgress: true,
        step: 'SWAP',
      })
      await get().gas.fetchGasInfo(curve)
      const chainId = curve.chainId
      const swapFn = networks[chainId].api.swap.swap
      const resp = await swapFn(activeKey, provider, llamma, formValues, maxSlippage)
      if (activeKey === get()[sliceKey].activeKey) {
        // re-fetch loan info
        get().loans.fetchLoanDetails(curve, llamma)

        // reset form
        const updatedFormValues = {
          ...DEFAULT_FORM_VALUES,
          item1Key: formValues.item1Key,
          item2Key: formValues.item2Key,
        }

        // re-fetch max
        get()[sliceKey].fetchMaxSwappable(chainId, llamma, updatedFormValues)

        get()[sliceKey].setStateByKeys({
          activeKey: getSwapActiveKey(llamma, updatedFormValues),
          detailInfo: {},
          formEstGas: {},
          formValues: updatedFormValues,
          formStatus: {
            ...get()[sliceKey].formStatus,
            error: resp.error,
            isInProgress: false,
            isComplete: !resp.error,
            step: '',
          },
          maxSwappable: {},
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
    setStateByKeys: <T>(sliceState: Partial<SliceState>) => {
      get().setAppStateByKeys(sliceKey, sliceState)
    },
    resetState: () => {
      get().resetAppState(sliceKey, cloneDeep(DEFAULT_STATE))
    },
  },
})

export function getSwapActiveKey(llamma: Llamma, { item1Key, item1, item2, item2Key }: FormValues) {
  return `${llamma.collateralSymbol}-${item1Key}-${item1}-${item2Key}-${item2}`
}

export function getMaxSwappableActiveKey(llamma: Llamma, { item1Key, item2Key }: FormValues) {
  return `${llamma.collateralSymbol}-${item1Key}-${item2Key}`
}

export default createLoanSwap
