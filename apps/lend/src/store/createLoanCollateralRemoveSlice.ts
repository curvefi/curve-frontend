import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type { FormDetailInfo, FormEstGas } from '@/components/PageLoanManage/types'
import type { FormStatus, FormValues } from '@/components/PageLoanManage/LoanCollateralRemove/types'

import cloneDeep from 'lodash/cloneDeep'
import merge from 'lodash/merge'

import { DEFAULT_FORM_EST_GAS, DEFAULT_FORM_STATUS as FORM_STATUS } from '@/components/PageLoanManage/utils'
import apiLending, { helpers } from '@/lib/apiLending'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  activeKey: string
  detailInfo: { [activeKey: string]: FormDetailInfo }
  formEstGas: { [activeKey: string]: FormEstGas }
  formStatus: FormStatus
  formValues: FormValues
  maxRemovable: string
}

const sliceKey = 'loanCollateralRemove'

// prettier-ignore
export type LoanCollateralRemoveSlice = {
  [sliceKey]: SliceState & {
    fetchMaxRemovable(api: Api, owmData: OWMData): Promise<void>
    fetchDetailInfo(activeKey: string, api: Api, owmData: OWMData): Promise<void>
    fetchEstGas(activeKey: string, api: Api, owmData: OWMData): Promise<void>
    setFormValues(api: Api | null, owmData: OWMData | undefined, partialFormValues: Partial<FormValues>, maxRemovable: string): Promise<void>

    // step
    fetchStepDecrease(activeKey: string, api: Api, owmData: OWMData, formValues: FormValues): Promise<{ activeKey: string; error: string; hash: string } | undefined>

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

const createLoanCollateralRemove = (set: SetState<State>, get: GetState<State>): LoanCollateralRemoveSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchMaxRemovable: async (api, owmData) => {
      const { signerAddress } = api

      if (!signerAddress) return

      const resp = await apiLending.loanCollateralRemove.maxRemovable(owmData)
      get()[sliceKey].setStateByKey('maxRemovable', resp.maxRemovable)

      // validation
      const cFormValues = cloneDeep(get()[sliceKey].formValues)
      cFormValues.collateralError = helpers.isTooMuch(cFormValues.collateral, resp.maxRemovable) ? 'too-much-max' : ''
      get()[sliceKey].setStateByKey('formValues', cloneDeep(cFormValues))
    },
    fetchDetailInfo: async (activeKey, api, owmData) => {
      const { signerAddress } = api
      const { collateral, collateralError } = get()[sliceKey].formValues

      if (!signerAddress || +collateral <= 0 || collateralError) return

      const resp = await apiLending.loanCollateralRemove.detailInfo(activeKey, api, owmData, collateral)
      get()[sliceKey].setStateByActiveKey('detailInfo', resp.activeKey, resp.resp)
    },
    fetchEstGas: async (activeKey, api, owmData) => {
      const { signerAddress } = api
      const { collateral, collateralError } = get()[sliceKey].formValues

      if (!signerAddress || +collateral <= 0 || collateralError) return

      get()[sliceKey].setStateByKey('formEstGas', { [activeKey]: { ...DEFAULT_FORM_EST_GAS, loading: true } })
      await get().gas.fetchGasInfo(api)
      const resp = await apiLending.loanCollateralRemove.estGas(activeKey, owmData, collateral)
      get()[sliceKey].setStateByKey('formEstGas', { [resp.activeKey]: { estimatedGas: resp.estimatedGas } })

      // update formStatus
      const cFormStatus = cloneDeep(get()[sliceKey].formStatus)
      cFormStatus.error = cFormStatus.error || resp.error
      get()[sliceKey].setStateByKey('formStatus', cFormStatus)
    },
    setFormValues: async (api, owmData, partialFormValues) => {
      const storedFormStatus = get()[sliceKey].formStatus
      const storedFormValues = get()[sliceKey].formValues

      // update activeKey, formValues
      const cFormValues: FormValues = cloneDeep({ ...storedFormValues, ...partialFormValues, collateralError: '' })
      const cFormStatus: FormStatus = cloneDeep({ ...DEFAULT_FORM_STATUS, isApproved: storedFormStatus.isApproved })
      const activeKey = _getActiveKey(api, owmData, cFormValues.collateral)
      get()[sliceKey].setStateByKeys({ activeKey, formValues: cloneDeep(cFormValues), formStatus: cFormStatus })

      if (!api || !owmData) return

      // api calls
      await get()[sliceKey].fetchMaxRemovable(api, owmData)
      get()[sliceKey].fetchDetailInfo(activeKey, api, owmData)
      get()[sliceKey].fetchEstGas(activeKey, api, owmData)
    },

    // steps
    fetchStepDecrease: async (activeKey, api, owmData) => {
      const provider = get().wallet.getProvider(sliceKey)

      if (!provider) return

      // update formStatus
      const partialFormStatus: Partial<FormStatus> = { isInProgress: true, step: 'REMOVE' }
      get()[sliceKey].setStateByKey('formStatus', merge(cloneDeep(get()[sliceKey].formStatus), partialFormStatus))

      await get().gas.fetchGasInfo(api)
      const { collateral } = get()[sliceKey].formValues
      const resp = await apiLending.loanCollateralRemove.removeCollateral(activeKey, provider, owmData, collateral)

      if (resp.activeKey === get()[sliceKey].activeKey) {
        // api calls
        get()[sliceKey].fetchMaxRemovable(api, owmData)
        const loanExists = (await get().user.fetchUserLoanExists(api, owmData, true))?.loanExists
        if (loanExists) get().user.fetchAll(api, owmData, true)
        get().markets.fetchAll(api, owmData, true)

        // update formStatus
        const partialFormStatus: Partial<FormStatus> = { error: resp.error, isApproved: true, isComplete: !resp.error }
        get()[sliceKey].setStateByKeys(merge(cloneDeep(DEFAULT_STATE), { formStatus: partialFormStatus }))

        return resp
      }
    },

    // helpers
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

export default createLoanCollateralRemove

export function _getActiveKey(api: Api | null, owmData: OWMData | undefined, collateral: string) {
  return `${api?.chainId ?? ''}-${owmData?.owm?.id ?? ''}-${collateral}`
}
