import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type { FormDetailInfo, FormEstGas } from '@/components/PageLoanManage/types'
import type { FormStatus, FormValues } from '@/components/PageLoanManage/LoanCollateralRemove/types'

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
  maxRemovable: string
}

const sliceKey = 'loanCollateralRemove'

// prettier-ignore
export type LoanCollateralRemoveSlice = {
  [sliceKey]: SliceState & {
    fetchMaxRemovable(api: Api, owmData: OWMData): Promise<void>
    fetchDetailInfo(activeKey: string, api: Api, owmData: OWMData): Promise<void>
    fetchEstGas(activeKey: string, api: Api, owmData: OWMData): Promise<void>
    setFormValues(api: Api | null, owmData: OWMData | undefined, partialFormValues: Partial<FormValues>, shouldRefetch?: boolean): Promise<void>

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

const { loanCollateralRemove } = apiLending
const { isTooMuch } = helpers

const createLoanCollateralRemove = (_: SetState<State>, get: GetState<State>): LoanCollateralRemoveSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchMaxRemovable: async (api, owmData) => {
      const { formStatus, formValues, ...sliceState } = get()[sliceKey]
      const { signerAddress } = api

      if (!signerAddress) return

      const resp = await loanCollateralRemove.maxRemovable(owmData)
      if (resp.error) sliceState.setStateByKey('formStatus', { ...formStatus, error: resp.error })
      sliceState.setStateByKey('maxRemovable', resp.maxRemovable)

      // validation
      const collateralError = isTooMuch(formValues.collateral, resp.maxRemovable) ? 'too-much-max' : ''
      sliceState.setStateByKey('formValues', { ...formValues, collateralError })
    },
    fetchDetailInfo: async (activeKey, api, owmData) => {
      const { formValues, ...sliceState } = get()[sliceKey]
      const { signerAddress } = api
      const { collateral, collateralError } = formValues

      if (!signerAddress || +collateral <= 0 || collateralError) return

      const resp = await loanCollateralRemove.detailInfo(activeKey, api, owmData, collateral)
      sliceState.setStateByActiveKey('detailInfo', resp.activeKey, resp.resp)
    },
    fetchEstGas: async (activeKey, api, owmData) => {
      const { gas } = get()
      const { formStatus, formValues, ...sliceState } = get()[sliceKey]
      const { signerAddress } = api
      const { collateral, collateralError } = formValues

      if (!signerAddress || +collateral <= 0 || collateralError) return

      sliceState.setStateByKey('formEstGas', { [activeKey]: { ...DEFAULT_FORM_EST_GAS, loading: true } })
      await gas.fetchGasInfo(api)
      const resp = await loanCollateralRemove.estGas(activeKey, owmData, collateral)
      sliceState.setStateByKey('formEstGas', { [resp.activeKey]: { estimatedGas: resp.estimatedGas, loading: false } })

      // update formStatus
      sliceState.setStateByKey('formStatus', { ...formStatus, error: formStatus.error || resp.error })
    },
    setFormValues: async (api, owmData, partialFormValues, shouldRefetch) => {
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
        const userBalances = await user.fetchUserMarketBalances(api, owmData, shouldRefetch)
        const collateralError = isTooMuch(cFormValues.collateral, userBalances?.collateral) ? 'too-much' : ''
        sliceState.setStateByKey('formValues', { ...cFormValues, collateralError })
      }

      // api calls
      await sliceState.fetchMaxRemovable(api, owmData)
      sliceState.fetchDetailInfo(activeKey, api, owmData)
      sliceState.fetchEstGas(activeKey, api, owmData)
    },

    // steps
    fetchStepDecrease: async (activeKey, api, owmData) => {
      const { gas, markets, wallet, user } = get()
      const { formStatus, formValues, ...sliceState } = get()[sliceKey]
      const provider = wallet.getProvider(sliceKey)

      if (!provider) return

      // update formStatus
      sliceState.setStateByKey('formStatus', {
        ...DEFAULT_FORM_STATUS,
        isApproved: formStatus.isApproved,
        isInProgress: true,
        step: 'REMOVE',
      })

      await gas.fetchGasInfo(api)
      const { error, ...resp } = await loanCollateralRemove.removeCollateral(
        activeKey,
        provider,
        owmData,
        formValues.collateral
      )

      if (resp.activeKey === get()[sliceKey].activeKey) {
        if (error) {
          sliceState.setStateByKey('formStatus', { ...DEFAULT_FORM_STATUS, stepError: error })
          return { ...resp, error }
        } else {
          // api calls
          const loanExists = (await user.fetchUserLoanExists(api, owmData, true))?.loanExists
          if (loanExists) user.fetchAll(api, owmData, true)
          markets.fetchAll(api, owmData, true)

          // update formStatus
          sliceState.setStateByKeys({
            ...DEFAULT_STATE,
            formStatus: { ...DEFAULT_FORM_STATUS, isComplete: true },
          })
          sliceState.setFormValues(api, owmData, DEFAULT_FORM_VALUES)
          return { ...resp, error }
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

export default createLoanCollateralRemove

export function _getActiveKey(api: Api | null, owmData: OWMData | undefined, collateral: string) {
  return `${_parseActiveKey(api, owmData)}-${collateral}`
}
