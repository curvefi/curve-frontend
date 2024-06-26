import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type { FormDetailInfo, FormEstGas } from '@/components/PageLoanManage/types'
import type { FormStatus, FormValues } from '@/components/PageLoanManage/LoanCollateralAdd/types'

import cloneDeep from 'lodash/cloneDeep'

import { DEFAULT_FORM_EST_GAS, DEFAULT_FORM_STATUS as FORM_STATUS } from '@/components/PageLoanManage/utils'
import { _parseActiveKey } from '@/utils/helpers'
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

const { loanCollateralAdd } = apiLending
const { isTooMuch } = helpers

const createLoanCollateralAdd = (_: SetState<State>, get: GetState<State>): LoanCollateralAddSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchDetailInfo: async (activeKey, api, owmData) => {
      const { formValues, ...sliceState } = get()[sliceKey]
      const { signerAddress } = api
      const { collateral } = formValues

      if (!signerAddress || +collateral <= 0) return

      const resp = await loanCollateralAdd.detailInfo(activeKey, api, owmData, collateral)
      sliceState.setStateByActiveKey('detailInfo', resp.activeKey, resp.resp)
    },
    fetchEstGasApproval: async (activeKey, api, owmData) => {
      const { gas } = get()
      const { formStatus, formValues, ...sliceState } = get()[sliceKey]
      const { signerAddress } = api
      const { collateral, collateralError } = formValues

      if (!signerAddress || +collateral <= 0 || collateralError) return

      sliceState.setStateByKey('formEstGas', { [activeKey]: { ...DEFAULT_FORM_EST_GAS, loading: true } })
      await gas.fetchGasInfo(api)
      const resp = await loanCollateralAdd.estGasApproval(activeKey, owmData, collateral)
      sliceState.setStateByKey('formEstGas', { [resp.activeKey]: { estimatedGas: resp.estimatedGas, loading: false } })

      // update formStatus
      sliceState.setStateByKey('formStatus', {
        ...formStatus,
        isApproved: resp.isApproved,
        error: formStatus.error || resp.error,
      })
    },
    setFormValues: async (api, owmData, partialFormValues) => {
      const { user } = get()
      const { formStatus, formValues, ...sliceState } = get()[sliceKey]

      // update activeKey, formValues
      const cFormValues: FormValues = { ...formValues, ...partialFormValues, collateralError: '' }
      const cFormStatus: FormStatus = { ...DEFAULT_FORM_STATUS, isApproved: formStatus.isApproved }
      const activeKey = _getActiveKey(api, owmData, cFormValues.collateral)
      sliceState.setStateByKeys({ activeKey, formValues: cFormValues, formStatus: cFormStatus })

      if (!api || !owmData) return

      const { signerAddress } = api

      // validation
      if (signerAddress) {
        const userBalancesResp = await user.fetchUserMarketBalances(api, owmData, true)
        const collateralError = isTooMuch(cFormValues.collateral, userBalancesResp.collateral) ? 'too-much' : ''
        sliceState.setStateByKey('formValues', { ...cFormValues, collateralError })
      }

      // api calls
      sliceState.fetchDetailInfo(activeKey, api, owmData)
      sliceState.fetchEstGasApproval(activeKey, api, owmData)
    },

    // step
    fetchStepApprove: async (activeKey, api, owmData, formValues) => {
      const { gas, wallet } = get()
      const sliceState = get()[sliceKey]
      const provider = wallet.getProvider(sliceKey)

      if (!provider) return

      // loading state
      sliceState.setStateByKey('formStatus', { ...DEFAULT_FORM_STATUS, isInProgress: true, step: 'APPROVAL' })

      // api calls
      await gas.fetchGasInfo(api)
      const { error, ...resp } = await loanCollateralAdd.approve(activeKey, provider, owmData, formValues.collateral)

      if (resp.activeKey === get()[sliceKey].activeKey) {
        // update formStatus
        sliceState.setStateByKey('formStatus', {
          ...DEFAULT_FORM_STATUS,
          stepError: error,
          isApproved: !error,
          isInProgress: !error,
        })
        if (!error) sliceState.fetchEstGasApproval(activeKey, api, owmData)
        return { ...resp, error }
      }
    },
    fetchStepIncrease: async (activeKey, api, owmData, formValues) => {
      const { gas, markets, wallet, user } = get()
      const sliceState = get()[sliceKey]
      const provider = wallet.getProvider(sliceKey)

      if (!provider) return

      // loading
      sliceState.setStateByKey('formStatus', {
        ...DEFAULT_FORM_STATUS,
        isApproved: true,
        isInProgress: true,
        step: 'ADD',
      })

      await gas.fetchGasInfo(api)
      const { error, ...resp } = await loanCollateralAdd.addCollateral(
        activeKey,
        provider,
        owmData,
        formValues.collateral
      )

      if (resp.activeKey === get()[sliceKey].activeKey) {
        if (error) {
          sliceState.setStateByKey('formStatus', { ...DEFAULT_FORM_STATUS, stepError: error, isApproved: true })
          return { ...resp, error, loanExists: true }
        } else {
          // api calls
          const loanExists = (await user.fetchUserLoanExists(api, owmData, true))?.loanExists
          if (loanExists) user.fetchAll(api, owmData, true)
          markets.fetchAll(api, owmData, true)

          // update formStatus
          sliceState.setStateByKeys({
            ...DEFAULT_STATE,
            formStatus: { ...DEFAULT_FORM_STATUS, isApproved: true, isComplete: true },
          })

          return { ...resp, error, loanExists }
        }
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

export function _getActiveKey(api: Api | null, owmData: OWMData | undefined, collateral: string) {
  return `${_parseActiveKey(api, owmData)}-${collateral}`
}
