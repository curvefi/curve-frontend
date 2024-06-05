import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type { FormStatus, FormValues } from '@/components/PageLoanManage/LoanCollateralAdd/types'
import type { FormDetailInfo, FormEstGas } from '@/components/PageLoanManage/types'

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
}

const sliceKey = 'loanCollateralAdd'

// prettier-ignore
export type LoanCollateralAddSlice = {
  [sliceKey]: SliceState & {
    fetchDetailInfo(activeKey: string, api: Api, owmData: OWMData): Promise<void>
    fetchEstGasApproval(activeKey: string, api: Api, owmData: OWMData): Promise<void>
    setFormValues(api: Api | null, owmData: OWMData | undefined, formValues: Partial<FormValues>): Promise<void>

    // steps
    fetchStepApprove(activeKey: string, api: Api, owmData: OWMData, formValues: FormValues): Promise<{ hashes: string[]; activeKey: string; error: string } | undefined>
    fetchStepIncrease(activeKey: string, api: Api, owmData: OWMData, formValues: FormValues): Promise<{ activeKey: string; error: string; hash: string; loanExists: boolean } | undefined>

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

const createLoanCollateralAdd = (set: SetState<State>, get: GetState<State>): LoanCollateralAddSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchDetailInfo: async (activeKey, api, owmData) => {
      const { signerAddress } = api
      const { collateral } = get()[sliceKey].formValues

      if (!signerAddress || +collateral <= 0) return

      const resp = await apiLending.loanCollateralAdd.detailInfo(activeKey, api, owmData, collateral)
      get()[sliceKey].setStateByActiveKey('detailInfo', resp.activeKey, resp.resp)
    },
    fetchEstGasApproval: async (activeKey, api, owmData) => {
      const { signerAddress } = api
      const { collateral, collateralError } = get()[sliceKey].formValues

      if (!signerAddress || +collateral <= 0 || collateralError) return

      get()[sliceKey].setStateByKey('formEstGas', { [activeKey]: { ...DEFAULT_FORM_EST_GAS, loading: true } })
      await get().gas.fetchGasInfo(api)
      const resp = await apiLending.loanCollateralAdd.estGasApproval(activeKey, owmData, collateral)
      get()[sliceKey].setStateByKey('formEstGas', { [resp.activeKey]: { estimatedGas: resp.estimatedGas } })

      // update formStatus
      const cFormStatus = cloneDeep(get()[sliceKey].formStatus)
      cFormStatus.isApproved = resp.isApproved
      cFormStatus.error = cFormStatus.error || resp.error
      get()[sliceKey].setStateByKey('formStatus', cFormStatus)
    },
    setFormValues: async (api, owmData, partialFormValues) => {
      const storedFormStatus = get()[sliceKey].formStatus
      const storedFormValues = get()[sliceKey].formValues

      // update activeKey, formValues
      const cFormValues: FormValues = cloneDeep({ ...storedFormValues, ...partialFormValues, collateralError: '' })
      const cFormStatus: FormStatus = cloneDeep({ ...DEFAULT_FORM_STATUS, isApproved: storedFormStatus.isApproved })
      const activeKey = getActiveKey(api, owmData, cFormValues.collateral)
      get()[sliceKey].setStateByKeys({ activeKey, formValues: cloneDeep(cFormValues), formStatus: cFormStatus })

      if (!api || !owmData) return

      const { signerAddress } = api

      // validations
      if (signerAddress) {
        const userBalancesResp = await get().user.fetchUserMarketBalances(api, owmData, true)
        cFormValues.collateralError = helpers.isTooMuch(cFormValues.collateral, userBalancesResp.collateral)
          ? 'too-much'
          : ''
        get()[sliceKey].setStateByKey('formValues', cloneDeep(cFormValues))
      }

      // api calls
      get()[sliceKey].fetchDetailInfo(activeKey, api, owmData)
      get()[sliceKey].fetchEstGasApproval(activeKey, api, owmData)
    },

    // step
    fetchStepApprove: async (activeKey, api, owmData, formValues) => {
      const provider = get().wallet.getProvider(sliceKey)

      if (!provider) return

      // update formStatus
      const partialFormStatus: Partial<FormStatus> = { isInProgress: true, step: 'APPROVAL' }
      get()[sliceKey].setStateByKey('formStatus', merge(cloneDeep(get()[sliceKey].formStatus), partialFormStatus))

      // api calls
      await get().gas.fetchGasInfo(api)
      const resp = await apiLending.loanCollateralAdd.approve(activeKey, provider, owmData, formValues.collateral)

      if (resp.activeKey === get()[sliceKey].activeKey) {
        // update formStatus
        const partialFormStatus: Partial<FormStatus> = {
          error: resp.error,
          isApproved: !resp.error,
          isInProgress: true,
        }
        get()[sliceKey].setStateByKey('formStatus', merge(cloneDeep(FORM_STATUS), partialFormStatus))
        if (!resp.error) get()[sliceKey].fetchEstGasApproval(activeKey, api, owmData)
        return resp
      }
    },
    fetchStepIncrease: async (activeKey, api, owmData, formValues) => {
      const provider = get().wallet.getProvider(sliceKey)

      if (!provider) return

      // update formStatus
      const partialFormStatus: Partial<FormStatus> = { isInProgress: true, step: 'ADD' }
      get()[sliceKey].setStateByKey('formStatus', merge(cloneDeep(get()[sliceKey].formStatus), partialFormStatus))

      await get().gas.fetchGasInfo(api)
      const resp = await apiLending.loanCollateralAdd.addCollateral(activeKey, provider, owmData, formValues.collateral)

      if (resp.activeKey === get()[sliceKey].activeKey) {
        // api calls
        const loanExists = (await get().user.fetchUserLoanExists(api, owmData, true))?.loanExists
        if (loanExists) get().user.fetchAll(api, owmData, true)
        get().markets.fetchAll(api, owmData, true)

        // update formStatus
        const partialFormStatus: Partial<FormStatus> = { error: resp.error, isApproved: true, isComplete: !resp.error }
        get()[sliceKey].setStateByKeys(merge(cloneDeep(DEFAULT_STATE), { formStatus: partialFormStatus }))

        return { ...resp, loanExists }
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

export default createLoanCollateralAdd

export function getActiveKey(api: Api | null, owmData: OWMData | undefined, collateral: string) {
  return `${api?.chainId ?? ''}-${owmData?.owm?.id ?? ''}-${collateral}`
}
