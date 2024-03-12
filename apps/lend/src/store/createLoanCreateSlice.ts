import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type { FormDetailInfo, FormEstGas } from '@/components/PageLoanManage/types'
import type { FormStatus, FormValues } from '@/components/PageLoanCreate/LoanFormCreate/types'
import type { LiqRange, LiqRangesMapper } from '@/store/types'

import cloneDeep from 'lodash/cloneDeep'
import merge from 'lodash/merge'

import { DEFAULT_FORM_EST_GAS, DEFAULT_FORM_STATUS as FORM_STATUS } from '@/components/PageLoanManage/utils'
import { DEFAULT_FORM_STATUS, DEFAULT_FORM_VALUES } from '@/components/PageLoanCreate/LoanFormCreate/utils'
import apiLending, { helpers } from '@/lib/apiLending'

type StateKey = keyof typeof DEFAULT_STATE

const sliceKey = 'loanCreate'

type SliceState = {
  activeKey: string
  activeKeyLiqRange: string
  detailInfo: { [activeKey: string]: FormDetailInfo }
  formEstGas: { [activeKey: string]: FormEstGas }
  formStatus: FormStatus
  formValues: FormValues
  liqRanges: { [activeKey: string]: LiqRange[] }
  liqRangesMapper: { [activeKey: string]: LiqRangesMapper }
  maxRecv: { [activeKey: string]: string }
  isEditLiqRange: boolean
}

// prettier-ignore
export type LoanCreateSlice = {
  [sliceKey]: SliceState & {
    fetchMaxRecv(activeKey: string, api: Api, owmData: OWMData): Promise<void>
    fetchDetailInfo(activeKey: string, api: Api, owmData: OWMData): Promise<void>
    fetchLiqRanges(activeKeyLiqRange: string, api: Api, owmData: OWMData, isAdvancedMode: boolean): Promise<void>
    fetchEstGasApproval(activeKey: string, api: Api, owmData: OWMData, maxSlippage: string): Promise<void>
    setFormValues(rChainId: ChainId, api: Api | null, owmData: OWMData | undefined, partialFormValues: Partial<FormValues>, maxSlippage: string, isAdvancedMode: boolean): Promise<void>

    // steps
    fetchStepApprove(activeKey: string, api: Api, owmData: OWMData, formValues: FormValues, maxSlippage: string): Promise<{ hashes: string[]; activeKey: string; error: string } | undefined>
    fetchStepCreate(activeKey: string, api: Api, owmData: OWMData, formValues: FormValues, maxSlippage: string): Promise<{ activeKey: string; error: string; hash: string } | undefined>

    // steps helper
    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(isLeverage?: boolean): void
  }
}

const DEFAULT_STATE: SliceState = {
  activeKey: '',
  activeKeyLiqRange: '',
  detailInfo: {},
  formEstGas: {},
  formStatus: DEFAULT_FORM_STATUS,
  formValues: DEFAULT_FORM_VALUES,
  liqRanges: {},
  liqRangesMapper: {},
  maxRecv: {},
  isEditLiqRange: false,
}

const createLoanCreate = (set: SetState<State>, get: GetState<State>): LoanCreateSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchMaxRecv: async (activeKey, api, owmData) => {
      const { signerAddress } = api
      const { collateral, n } = get()[sliceKey].formValues

      if (n === null) return
      const resp = await apiLending.loanCreate.maxRecv(activeKey, owmData, collateral, n)
      get()[sliceKey].setStateByActiveKey('maxRecv', resp.activeKey, resp.maxRecv)

      // validation
      if (signerAddress) {
        const cFormValues = cloneDeep(get()[sliceKey].formValues)
        cFormValues.debtError = helpers.isTooMuch(cFormValues.debt, resp.maxRecv)
          ? 'too-much-debt'
          : cFormValues.debtError
        get()[sliceKey].setStateByKey('formValues', cFormValues)
      }
    },
    fetchDetailInfo: async (activeKey, api, owmData) => {
      const { collateral, debt, n, debtError } = get()[sliceKey].formValues

      if (+collateral <= 0 || +debt <= 0 || n === null || debtError) return

      const resp = await apiLending.loanCreate.detailInfo(activeKey, api, owmData, collateral, debt, n)
      get()[sliceKey].setStateByActiveKey('detailInfo', resp.activeKey, { ...resp.resp, loading: false })
    },
    fetchLiqRanges: async (activeKeyLiqRange, api, owmData, isAdvancedMode) => {
      const { collateral, debt, debtError } = get()[sliceKey].formValues

      if (+collateral <= 0 || +debt <= 0 || !isAdvancedMode || debtError) return

      const resp = await apiLending.loanCreate.liqRanges(activeKeyLiqRange, owmData, collateral, debt)
      get()[sliceKey].setStateByKey('liqRanges', { [activeKeyLiqRange]: resp.liqRanges })
      get()[sliceKey].setStateByKey('liqRangesMapper', { [activeKeyLiqRange]: resp.liqRangesMapper })
    },
    fetchEstGasApproval: async (activeKey, api, owmData, maxSlippage) => {
      const { signerAddress } = api
      const { collateral, debt, n, collateralError, debtError } = get()[sliceKey].formValues

      if (!signerAddress || +collateral <= 0 || +debt <= 0 || n === null || collateralError || debtError) return

      get()[sliceKey].setStateByKey('formEstGas', { [activeKey]: { ...DEFAULT_FORM_EST_GAS, loading: true } })
      await get().gas.fetchGasInfo(api)
      const resp = await apiLending.loanCreate.estGasApproval(activeKey, owmData, collateral, debt, n, maxSlippage)
      get()[sliceKey].setStateByKey('formEstGas', { [resp.activeKey]: { estimatedGas: resp.estimatedGas } })

      // update formStatus
      const cFormStatus = cloneDeep(get()[sliceKey].formStatus)
      cFormStatus.isApproved = resp.isApproved
      cFormStatus.error = resp.error || cFormStatus.error
      get()[sliceKey].setStateByKey('formStatus', cFormStatus)
    },
    setFormValues: async (rChainId, api, owmData, partialFormValues, maxSlippage, isAdvancedMode) => {
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
      let activeKeys = _getActiveKey(rChainId, owmData, cFormValues, maxSlippage)
      get()[sliceKey].setStateByKeys({ ...activeKeys, formValues: cloneDeep(cFormValues), formStatus: cFormStatus })

      if (!api || !owmData) return

      const { signerAddress } = api
      const { owm } = owmData

      // set default N
      cFormValues.n = cFormValues.n || owm.defaultBands
      activeKeys = _getActiveKey(rChainId, owmData, cFormValues, maxSlippage)
      get()[sliceKey].setStateByKeys({ ...activeKeys, formValues: cloneDeep(cFormValues) })

      if (signerAddress) {
        // validation
        const userBalancesResp = await get().user.fetchUserMarketBalances(api, owmData, true)
        cFormValues.collateralError = helpers.isTooMuch(cFormValues.collateral, userBalancesResp?.collateral)
          ? 'too-much-wallet'
          : ''
        get()[sliceKey].setStateByKeys({ ...activeKeys, formValues: cloneDeep(cFormValues) })
      }

      // api calls
      await get()[sliceKey].fetchMaxRecv(activeKeys.activeKey, api, owmData)
      get()[sliceKey].fetchEstGasApproval(activeKeys.activeKey, api, owmData, maxSlippage)
      get()[sliceKey].fetchDetailInfo(activeKeys.activeKey, api, owmData)
      get()[sliceKey].fetchLiqRanges(activeKeys.activeKeyLiqRange, api, owmData, isAdvancedMode)
    },

    // steps
    fetchStepApprove: async (activeKey, api, owmData, formValues, maxSlippage) => {
      const provider = get().wallet.getProvider(sliceKey)

      if (!provider) return

      // update formStatus
      const partialFormStatus: Partial<FormStatus> = { isInProgress: true, step: 'APPROVAL' }
      get()[sliceKey].setStateByKey('formStatus', merge(cloneDeep(get()[sliceKey].formStatus), partialFormStatus))

      // api calls
      await get().gas.fetchGasInfo(api)
      const { collateral } = formValues
      const resp = await apiLending.loanCreate.approve(activeKey, provider, owmData, collateral)

      if (resp.activeKey === get()[sliceKey].activeKey) {
        // update formStatus
        const partialFormStatus: Partial<FormStatus> = {
          error: resp.error,
          isApproved: !resp.error,
          isInProgress: true,
        }
        get()[sliceKey].setStateByKey('formStatus', merge(cloneDeep(FORM_STATUS), partialFormStatus))
        if (!resp.error) get()[sliceKey].fetchEstGasApproval(activeKey, api, owmData, maxSlippage)
        return resp
      }
    },
    fetchStepCreate: async (activeKey, api, owmData, formValues, maxSlippage) => {
      const { collateral, debt, n } = formValues
      const provider = get().wallet.getProvider(sliceKey)

      if (!provider || n === null) return

      // update formStatus
      const partialFormStatus: Partial<FormStatus> = { isInProgress: true, step: 'CREATE' }
      get()[sliceKey].setStateByKey('formStatus', merge(cloneDeep(get()[sliceKey].formStatus), partialFormStatus))

      await get().gas.fetchGasInfo(api)
      const resp = await apiLending.loanCreate.create(activeKey, provider, owmData, collateral, debt, n, maxSlippage)

      if (resp.activeKey === get()[sliceKey].activeKey) {
        // api calls
        const userLoanDetails = await get().user.fetchAll(api, owmData, true)
        get().markets.fetchAll(api, owmData, true)

        // update formStatus
        const partialFormStatus: Partial<FormStatus> = { error: resp.error, isApproved: true, isComplete: !resp.error }
        get()[sliceKey].setStateByKeys(merge(cloneDeep(DEFAULT_STATE), { formStatus: partialFormStatus }))
        return { ...resp, userLoanDetails }
      }
    },

    // helpers
    setStateByActiveKey: <T>(key: StateKey, activeKey: string, value: T) => {
      if (Object.keys(get()[sliceKey][key] ?? {}).length > 30) {
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
    resetState: () => {
      get().resetAppState(sliceKey, cloneDeep(DEFAULT_STATE))
    },
  },
})

export function _getActiveKey(
  rChainId: ChainId,
  owmData: OWMData | undefined,
  { collateral, debt, n }: FormValues,
  maxSlippage: string
) {
  let resp = { activeKey: '', activeKeyLiqRange: '' }
  if (!owmData) return resp

  resp.activeKeyLiqRange = `${rChainId}-${owmData?.owm?.id ?? ''}-${collateral}-${debt}`
  resp.activeKey = `${resp.activeKeyLiqRange}-${n}-${maxSlippage}`
  return resp
}

export default createLoanCreate
