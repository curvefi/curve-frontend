import type { GetState, SetState } from 'zustand'
import type { State } from '@loan/store/useStore'
import type { FormStatus, FormValues } from '@loan/components/PageLoanManage/CollateralIncrease/types'
import type { FormDetailInfo, FormEstGas } from '@loan/components/PageLoanManage/types'

import {
  DEFAULT_DETAIL_INFO,
  DEFAULT_FORM_EST_GAS,
  DEFAULT_FORM_STATUS as FORM_STATUS,
} from '@loan/components/PageLoanManage/utils'
import { loadingLRPrices } from '@loan/utils/utilsCurvejs'
import networks from '@loan/networks'
import cloneDeep from 'lodash/cloneDeep'
import { ChainId, Curve, Llamma } from '@loan/types/loan.types'
import { useWalletStore } from '@ui-kit/features/connect-wallet'
import { setMissingProvider } from '@ui-kit/features/connect-wallet'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  activeKey: string
  detailInfo: { [activeKey: string]: FormDetailInfo }
  formEstGas: { [activeKey: string]: FormEstGas }
  formStatus: FormStatus
  formValues: FormValues
}

const sliceKey = 'loanCollateralIncrease'

export type LoanCollateralIncreaseSlice = {
  [sliceKey]: SliceState & {
    fetchEstGasApproval(activeKey: string, chainId: ChainId, llamma: Llamma, formValues: FormValues): Promise<void>
    fetchDetailInfo(activeKey: string, chainId: ChainId, llamma: Llamma, formValues: FormValues): Promise<void>
    setFormValues(chainId: ChainId, llamma: Llamma, formValues: FormValues): Promise<void>

    // steps
    fetchStepApprove(
      activeKey: string,
      curve: Curve,
      llamma: Llamma,
      formValues: FormValues,
    ): Promise<{ hashes: string[]; activeKey: string; error: string } | undefined>
    fetchStepIncrease(
      activeKey: string,
      curve: Curve,
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
  step: '',
}

export const DEFAULT_FORM_VALUES: FormValues = {
  collateral: '',
  collateralError: '',
}

const DEFAULT_STATE: SliceState = {
  activeKey: '',
  detailInfo: {},
  formEstGas: {},
  formStatus: DEFAULT_FORM_STATUS,
  formValues: DEFAULT_FORM_VALUES,
}

const createLoanCollateralIncrease = (set: SetState<State>, get: GetState<State>) => ({
  [sliceKey]: {
    ...DEFAULT_STATE,
    fetchEstGasApproval: async (activeKey: string, chainId: ChainId, llamma: Llamma, formValues: FormValues) => {
      const { collateral } = formValues
      const estGasApprovalFn = networks[chainId].api.collateralIncrease.estGasApproval
      const resp = await estGasApprovalFn(activeKey, llamma, collateral)

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
      const { collateral } = formValues
      const detailInfoFn = networks[chainId].api.collateralIncrease.detailInfo
      const resp = await detailInfoFn(activeKey, llamma, collateral)

      get()[sliceKey].setStateByActiveKey('detailInfo', resp.activeKey, resp.resp)
    },
    setFormValues: async (chainId: ChainId, llamma: Llamma, formValues: FormValues) => {
      // stored values
      const prevActiveKey = get()[sliceKey].activeKey
      const storedFormEstGas = get()[sliceKey].formEstGas
      const storedDetailInfo = get()[sliceKey].detailInfo

      const cFormValues = cloneDeep(formValues)
      const { collateral } = formValues
      const activeKey = getCollateralIncreaseActiveKey(llamma, collateral)
      const haveCollateral = +collateral > 0
      const collateralBalance = get().loans.userWalletBalancesMapper[llamma.id]?.collateral ?? '0'

      // validate collateral
      const haveCollateralBalance = +collateralBalance > 0
      const isValid = haveCollateralBalance && haveCollateral
      cFormValues.collateralError = isValid ? (+collateral > +collateralBalance ? 'too-much' : '') : ''

      const loadingFormEstGas = storedFormEstGas[activeKey] ??
        storedFormEstGas[prevActiveKey] ?? { ...DEFAULT_FORM_EST_GAS, loading: true }

      let loadingDetailInfo = cloneDeep(
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
        get()[sliceKey].fetchDetailInfo(activeKey, chainId, llamma, cFormValues)
        get()[sliceKey].fetchEstGasApproval(activeKey, chainId, llamma, cFormValues)
      } else {
        get()[sliceKey].setStateByActiveKey('detailInfo', activeKey, DEFAULT_DETAIL_INFO)
        get()[sliceKey].setStateByActiveKey('formEstGas', activeKey, DEFAULT_FORM_EST_GAS)
        get()[sliceKey].setStateByKey('formStatus', { ...get()[sliceKey].formStatus, error: '' })
      }
    },

    // step
    fetchStepApprove: async (activeKey: string, curve: Curve, llamma: Llamma, formValues: FormValues) => {
      const { provider } = useWalletStore.getState()
      if (!provider) return setMissingProvider(get()[sliceKey])

      get()[sliceKey].setStateByKey('formStatus', {
        ...get()[sliceKey].formStatus,
        isInProgress: true,
        step: 'APPROVAL',
      })
      await get().gas.fetchGasInfo(curve)
      const chainId = curve.chainId
      const collateralIncreaseApproveFn = networks[chainId].api.collateralIncrease.approve
      const resp = await collateralIncreaseApproveFn(activeKey, provider, llamma, formValues.collateral)
      if (activeKey === get()[sliceKey].activeKey) {
        get()[sliceKey].setStateByKey('formStatus', {
          ...get()[sliceKey].formStatus,
          isApproved: !resp.error,
          step: '',
          formProcessing: !resp.error,
          error: resp.error,
        })

        if (!resp.error) {
          get()[sliceKey].fetchEstGasApproval(activeKey, chainId, llamma, formValues)
        }
        return resp
      }
    },
    fetchStepIncrease: async (activeKey: string, curve: Curve, llamma: Llamma, formValues: FormValues) => {
      const { provider } = useWalletStore.getState()
      if (!provider) return setMissingProvider(get()[sliceKey])

      get()[sliceKey].setStateByKey('formStatus', {
        ...get()[sliceKey].formStatus,
        isInProgress: true,
        step: 'ADD',
      })
      const chainId = curve.chainId
      await get().gas.fetchGasInfo(curve)
      const addCollateralFn = networks[chainId].api.collateralIncrease.addCollateral
      const resp = await addCollateralFn(activeKey, provider, llamma, formValues.collateral)
      if (activeKey === get()[sliceKey].activeKey) {
        // re-fetch loan info
        const { loanExists } = await get().loans.fetchLoanDetails(curve, llamma)

        if (!loanExists.loanExists) {
          get().loans.resetUserDetailsState(llamma)
        }

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

        return { ...resp, loanExists: loanExists.loanExists }
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

export default createLoanCollateralIncrease

export function getCollateralIncreaseActiveKey(llamma: Llamma, collateral: string) {
  return `${llamma.collateralSymbol}-${collateral}`
}
