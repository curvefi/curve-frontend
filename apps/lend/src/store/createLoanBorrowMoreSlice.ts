import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type { FormDetailInfo, FormEstGas } from '@/components/PageLoanManage/types'
import type { FormStatus, FormValues } from '@/components/PageLoanManage/LoanBorrowMore/types'

import cloneDeep from 'lodash/cloneDeep'
import merge from 'lodash/merge'

import { DEFAULT_FORM_EST_GAS, DEFAULT_FORM_STATUS as FORM_STATUS } from '@/components/PageLoanManage/utils'
import { DEFAULT_FORM_STATUS, DEFAULT_FORM_VALUES } from '@/components/PageLoanManage/LoanBorrowMore/utils'
import apiLending, { helpers } from '@/lib/apiLending'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  activeKey: string
  detailInfo: { [activeKey: string]: FormDetailInfo }
  formEstGas: { [activeKey: string]: FormEstGas }
  formStatus: FormStatus
  formValues: FormValues
  maxRecv: { [activeKey: string]: { maxRecv: string; error: string } }
}

const sliceKey = 'loanBorrowMore'

// prettier-ignore
export type LoanBorrowMoreSlice = {
  [sliceKey]: SliceState & {
    fetchMaxRecv(api: Api, owmData: OWMData): Promise<void>
    fetchDetailInfo(activeKey: string, api: Api, owmData: OWMData): Promise<void>
    fetchEstGasApproval(activeKey: string, api: Api, owmData: OWMData): Promise<void>
    setFormValues(api: Api | null, owmData: OWMData | undefined, partialFormValues: Partial<FormValues>): Promise<void>

    // steps
    fetchStepApprove(activeKey: string, api: Api, owmData: OWMData, formValues: FormValues): Promise<{ hashes: string[]; error: string } | undefined>
    fetchStepIncrease(activeKey: string, api: Api, owmData: OWMData, formValues: FormValues): Promise<{ activeKey: string; error: string; hash: string } | undefined>

    // steps helper
    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  activeKey: '',
  detailInfo: {},
  formEstGas: {},
  formStatus: DEFAULT_FORM_STATUS,
  formValues: DEFAULT_FORM_VALUES,
  maxRecv: {},
}

const createLoanBorrowMore = (set: SetState<State>, get: GetState<State>): LoanBorrowMoreSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchMaxRecv: async (api, owmData) => {
      const { signerAddress } = api
      const { collateral } = get()[sliceKey].formValues

      if (!signerAddress) return

      const resp = await apiLending.loanBorrowMore.maxRecv(owmData, collateral)
      const maxRecvActiveKey = _getMaxRecvActiveKey(api, owmData, collateral)
      get()[sliceKey].setStateByActiveKey('maxRecv', maxRecvActiveKey, resp)

      // validation
      const cFormValues = cloneDeep(get()[sliceKey].formValues)
      cFormValues.debtError = helpers.isTooMuch(cFormValues.debt, resp.maxRecv) ? 'too-much-max' : ''
      get()[sliceKey].setStateByKey('formValues', cFormValues)
    },
    fetchDetailInfo: async (activeKey, api, owmData) => {
      const { signerAddress } = api
      const { collateral, debt } = get()[sliceKey].formValues

      if (!signerAddress || +debt <= 0) return

      const resp = await apiLending.loanBorrowMore.detailInfo(activeKey, api, owmData, collateral, debt)
      get()[sliceKey].setStateByActiveKey('detailInfo', resp.activeKey, { ...resp.resp, loading: false })
    },
    fetchEstGasApproval: async (activeKey, api, owmData) => {
      const { signerAddress } = api
      const { collateral, collateralError, debt, debtError } = get()[sliceKey].formValues

      if (!signerAddress || +collateral < 0 || collateralError || +debt <= 0 || debtError) return

      get()[sliceKey].setStateByKey('formEstGas', { [activeKey]: { ...DEFAULT_FORM_EST_GAS, loading: true } })
      await get().gas.fetchGasInfo(api)
      const resp = await apiLending.loanBorrowMore.estGasApproval(activeKey, owmData, collateral, debt)
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
      const cFormValues: FormValues = cloneDeep({
        ...storedFormValues,
        ...partialFormValues,
        collateralError: '',
        debtError: '',
      })
      const cFormStatus: FormStatus = cloneDeep({ ...DEFAULT_FORM_STATUS, isApproved: storedFormStatus.isApproved })
      const activeKey = _getActiveKey(api, owmData, cFormValues)
      get()[sliceKey].setStateByKeys({ activeKey, formValues: cloneDeep(cFormValues), formStatus: cFormStatus })

      if (!api || !owmData) return

      const { signerAddress } = api

      // validate collateral
      if (signerAddress) {
        const userBalancesResp = await get().user.fetchUserMarketBalances(api, owmData, true)
        cFormValues.collateralError = helpers.isTooMuch(cFormValues.collateral, userBalancesResp?.collateral)
          ? 'too-much-wallet'
          : ''
        get()[sliceKey].setStateByKey('formValues', cloneDeep(cFormValues))
      }

      // api calls
      await get()[sliceKey].fetchMaxRecv(api, owmData)
      get()[sliceKey].fetchDetailInfo(activeKey, api, owmData)
      get()[sliceKey].fetchEstGasApproval(activeKey, api, owmData)
    },

    // steps
    fetchStepApprove: async (activeKey, api, owmData, formValues) => {
      const provider = get().wallet.getProvider(sliceKey)

      if (!provider) return

      // update formStatus
      const partialFormStatus: Partial<FormStatus> = { isInProgress: true, step: 'APPROVAL' }
      get()[sliceKey].setStateByKey('formStatus', merge(cloneDeep(get()[sliceKey].formStatus), partialFormStatus))

      // api calls
      await get().gas.fetchGasInfo(api)
      const { collateral } = formValues
      const resp = await apiLending.loanBorrowMore.approve(activeKey, provider, owmData, collateral)

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
      const partialFormStatus: Partial<FormStatus> = { isInProgress: true, step: 'BORROW_MORE' }
      get()[sliceKey].setStateByKey('formStatus', merge(cloneDeep(get()[sliceKey].formStatus), partialFormStatus))

      // api call
      await get().gas.fetchGasInfo(api)
      const { collateral, debt } = formValues
      const resp = await apiLending.loanBorrowMore.borrowMore(activeKey, provider, owmData, collateral, debt)

      if (resp.activeKey === get()[sliceKey].activeKey) {
        // api calls
        const loanExists = (await get().user.fetchUserLoanExists(api, owmData, true))?.loanExists
        if (loanExists) get().user.fetchAll(api, owmData, true)
        get()[sliceKey].fetchMaxRecv(api, owmData)
        get().markets.fetchAll(api, owmData, true)

        // update formStatus
        const partialFormStatus: Partial<FormStatus> = { error: resp.error, isApproved: true, isComplete: !resp.error }
        get()[sliceKey].setStateByKeys(merge(cloneDeep(DEFAULT_STATE), { formStatus: partialFormStatus }))

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

export default createLoanBorrowMore

export function _getActiveKey(api: Api | null, owmData: OWMData | undefined, { collateral, debt }: FormValues) {
  return `${api?.chainId ?? ''}-${owmData?.owm?.id ?? ''}-${collateral}-${debt}`
}

export function _getMaxRecvActiveKey(api: Api | null, owmData: OWMData | undefined, collateral: string) {
  return `${api?.chainId ?? ''}-${owmData?.owm?.id ?? ''}-${collateral}`
}
