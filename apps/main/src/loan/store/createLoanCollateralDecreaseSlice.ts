import cloneDeep from 'lodash/cloneDeep'
import type { GetState, SetState } from 'zustand'
import type { FormStatus, FormValues } from '@/loan/components/PageLoanManage/CollateralDecrease/types'
import type { FormDetailInfo, FormEstGas } from '@/loan/components/PageLoanManage/types'
import {
  DEFAULT_DETAIL_INFO,
  DEFAULT_FORM_EST_GAS,
  DEFAULT_FORM_STATUS as FORM_STATUS,
} from '@/loan/components/PageLoanManage/utils'
import networks from '@/loan/networks'
import type { State } from '@/loan/store/useStore'
import { ChainId, LlamalendApi, Llamma } from '@/loan/types/loan.types'
import { loadingLRPrices } from '@/loan/utils/utilsCurvejs'
import { getTokenName } from '@/loan/utils/utilsLoan'
import { setMissingProvider, useWallet } from '@ui-kit/features/connect-wallet'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  activeKey: string
  detailInfo: { [activeKey: string]: FormDetailInfo }
  formEstGas: { [activeKey: string]: FormEstGas }
  formStatus: FormStatus
  formValues: FormValues
  maxRemovable: string
}

const sliceKey = 'loanCollateralDecrease'

export type LoanCollateralDecreaseSlice = {
  [sliceKey]: SliceState & {
    init(chainId: ChainId, llamma: Llamma): void
    fetchEstGas(activeKey: string, chainId: ChainId, llamma: Llamma, formValues: FormValues): Promise<void>
    fetchDetailInfo(activeKey: string, chainId: ChainId, llamma: Llamma, formValues: FormValues): Promise<void>
    fetchMaxRemovable(chainId: ChainId, llamma: Llamma): Promise<void>
    setFormValues(chainId: ChainId, llamma: Llamma, formValues: FormValues, maxRemovable: string): Promise<void>

    // step
    fetchStepDecrease(
      activeKey: string,
      curve: LlamalendApi,
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

export const DEFAULT_FORM_VALUES: FormValues = {
  collateral: '',
  collateralError: '',
}

export const DEFAULT_FORM_STATUS: FormStatus = {
  ...FORM_STATUS,
  step: '',
}

const DEFAULT_STATE: SliceState = {
  activeKey: '',
  detailInfo: {},
  formEstGas: {},
  formStatus: DEFAULT_FORM_STATUS,
  formValues: DEFAULT_FORM_VALUES,
  maxRemovable: '',
}

const createLoanCollateralDecrease = (set: SetState<State>, get: GetState<State>) => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    init: (chainId: ChainId, llamma: Llamma) => {
      void get()[sliceKey].fetchMaxRemovable(chainId, llamma)
    },
    fetchEstGas: async (activeKey: string, chainId: ChainId, llamma: Llamma, formValues: FormValues) => {
      const { collateral } = formValues
      const estGasFn = networks[chainId].api.collateralDecrease.estGas
      const resp = await estGasFn(activeKey, llamma, collateral)

      get()[sliceKey].setStateByActiveKey('formEstGas', resp.activeKey, { estimatedGas: resp.estimatedGas })

      // update formStatus
      const clonedFormStatus = cloneDeep(get()[sliceKey].formStatus)
      if (!clonedFormStatus.error) {
        clonedFormStatus.error = resp.error
      }
      get()[sliceKey].setStateByKey('formStatus', clonedFormStatus)
    },
    fetchDetailInfo: async (activeKey: string, chainId: ChainId, llamma: Llamma, formValues: FormValues) => {
      const { collateral } = formValues
      const detailInfoFn = networks[chainId].api.collateralDecrease.detailInfo
      const resp = await detailInfoFn(activeKey, llamma, collateral)

      get()[sliceKey].setStateByActiveKey('detailInfo', resp.activeKey, resp.resp)
    },
    fetchMaxRemovable: async (chainId: ChainId, llamma: Llamma) => {
      const maxRemovableFn = networks[chainId].api.collateralDecrease.max
      const resp = await maxRemovableFn(llamma)

      get()[sliceKey].setStateByKey('maxRemovable', resp.maxRemovable)

      if (resp.error) {
        get()[sliceKey].setStateByKey('formStatus', { ...get()[sliceKey].formStatus, error: resp.error })
      }
    },
    setFormValues: async (chainId: ChainId, llamma: Llamma, formValues: FormValues, maxRemovable: string) => {
      // stored values
      const prevActiveKey = get()[sliceKey].activeKey
      const storedFormEstGas = get()[sliceKey].formEstGas
      const storedDetailInfo = get()[sliceKey].detailInfo

      const cFormValues = cloneDeep(formValues)
      const { collateral } = formValues
      const activeKey = getCollateralDecreaseActiveKey(llamma, collateral)
      const haveCollateral = +collateral > 0
      const haveCollateralAndMaxRemv = haveCollateral && !!maxRemovable

      // validate collateral
      cFormValues.collateralError = haveCollateralAndMaxRemv ? (+collateral > +maxRemovable ? 'too-much' : '') : ''

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

      // fetch detail, approval, est gas, set loading
      if (haveCollateral) {
        void get()[sliceKey].fetchDetailInfo(activeKey, chainId, llamma, cFormValues)
        void get()[sliceKey].fetchEstGas(activeKey, chainId, llamma, cFormValues)
      } else {
        get()[sliceKey].setStateByActiveKey('detailInfo', activeKey, DEFAULT_DETAIL_INFO)
        get()[sliceKey].setStateByActiveKey('formEstGas', activeKey, DEFAULT_FORM_EST_GAS)
        get()[sliceKey].setStateByKey('formStatus', { ...get()[sliceKey].formStatus, error: '' })
      }
    },

    // steps
    fetchStepDecrease: async (activeKey: string, curve: LlamalendApi, llamma: Llamma, formValues: FormValues) => {
      const { provider } = useWallet.getState()
      if (!provider) return setMissingProvider(get()[sliceKey])

      get()[sliceKey].setStateByKey('formStatus', {
        ...get()[sliceKey].formStatus,
        isInProgress: true,
        step: 'REMOVE',
      })
      await get().gas.fetchGasInfo(curve)
      const chainId = curve.chainId
      const removeCollateralFn = networks[chainId].api.collateralDecrease.removeCollateral
      const resp = await removeCollateralFn(activeKey, provider, llamma, formValues.collateral)
      void get()[sliceKey].fetchMaxRemovable(chainId, llamma)
      const { loanExists } = await get().loans.fetchLoanDetails(curve, llamma)
      if (!loanExists.loanExists) {
        get().loans.resetUserDetailsState(llamma)
      }
      if (resp.activeKey === get()[sliceKey].activeKey) {
        get()[sliceKey].setStateByKeys({
          detailInfo: {},
          formEstGas: {},
          formValues: DEFAULT_FORM_VALUES,
          formStatus: {
            ...get()[sliceKey].formStatus,
            error: resp.error,
            isInProgress: false,
            isComplete: !resp.error,
            step: '',
          },
        })

        return resp
      }
    },

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

export default createLoanCollateralDecrease

export function getCollateralDecreaseActiveKey(llamma: Llamma, collateral: string) {
  return `${getTokenName(llamma).collateral}-${collateral}`
}
