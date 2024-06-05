import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type { FormDetailInfo, FormEstGas } from '@/components/PageLoanManage/types'
import type { FormStatus, FormValues } from '@/components/PageLoanManage/LoanRepay/types'

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

const sliceKey = 'loanRepay'

// prettier-ignore
export type LoanRepaySlice = {
  [sliceKey]: SliceState & {
    fetchDetailInfo(activeKey: string, api: Api, owmData: OWMData): Promise<void>
    fetchEstGasApproval(activeKey: string, api: Api, owmData: OWMData): Promise<void>
    setFormValues(api: Api | null, owmData: OWMData | undefined, partialFormValues: Partial<FormValues>): Promise<void>

    // step
    fetchStepApprove(activeKey: string, api: Api, owmData: OWMData, formValues: FormValues): Promise<{ hashes: string[]; activeKey: string; error: string } | undefined>
    fetchStepDecrease(activeKey: string, api: Api, owmData: OWMData, formValues: FormValues): Promise<{ activeKey: string; error: string; hash: string; loanExists: boolean } | undefined>

    // steps helper
    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

export const DEFAULT_FORM_STATUS: FormStatus = {
  ...FORM_STATUS,
  warning: '',
  step: '',
}

export const DEFAULT_FORM_VALUES: FormValues = {
  debt: '',
  debtError: '',
  isFullRepay: false,
}

const DEFAULT_STATE: SliceState = {
  activeKey: '',
  detailInfo: {},
  formEstGas: {},
  formStatus: DEFAULT_FORM_STATUS,
  formValues: DEFAULT_FORM_VALUES,
}

const createLoanRepaySlice = (set: SetState<State>, get: GetState<State>): LoanRepaySlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchDetailInfo: async (activeKey, api, owmData) => {
      const { signerAddress } = api
      const { debt } = get()[sliceKey].formValues

      if (!signerAddress || +debt <= 0) return

      const resp = await apiLending.loanRepay.detailInfo(activeKey, api, owmData, debt)
      get()[sliceKey].setStateByActiveKey('detailInfo', activeKey, resp.resp)
    },
    fetchEstGasApproval: async (activeKey, api, owmData) => {
      const { signerAddress } = api
      const { debt, debtError, isFullRepay } = get()[sliceKey].formValues

      if (!signerAddress || (!isFullRepay && +debt <= 0) || debtError) return

      get()[sliceKey].setStateByKey('formEstGas', { [activeKey]: { ...DEFAULT_FORM_EST_GAS, loading: true } })
      await get().gas.fetchGasInfo(api)
      const resp = await apiLending.loanRepay.estGasApproval(activeKey, owmData, debt, isFullRepay)
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

      // update activeKey, formStatus, formValues
      const cFormValues: FormValues = cloneDeep({ ...storedFormValues, ...partialFormValues, debtError: '' })
      const cFormStatus: FormStatus = cloneDeep({ ...DEFAULT_FORM_STATUS, isApproved: storedFormStatus.isApproved })
      const { debt, isFullRepay } = cFormValues
      const activeKey = _getActiveKey(api, owmData, debt, isFullRepay)
      get()[sliceKey].setStateByKeys({
        activeKey,
        formValues: cloneDeep(cFormValues),
        formStatus: cFormStatus,
      })

      if (!api || !owmData) return

      const { signerAddress } = api

      if (isFullRepay) {
        // api calls
        get()[sliceKey].fetchEstGasApproval(activeKey, api, owmData)
      } else {
        if (signerAddress) {
          // check if formDebt is same as stateDebt, if true, update form to isFullRepay
          const userLoanState = await get().user.fetchUserLoanState(api, owmData, true)
          if (+userLoanState?.debt === +cFormValues.debt) {
            const updatedFormValues: Partial<FormValues> = { debt: '', debtError: '', isFullRepay: true }
            get()[sliceKey].setFormValues(api, owmData, updatedFormValues)
          } else {
            // validate debt
            const [userLoanState, userBalances] = await Promise.all([
              get().user.fetchUserLoanState(api, owmData, true),
              get().user.fetchUserMarketBalances(api, owmData, true),
            ])

            cFormValues.debtError = helpers.isTooMuch(cFormValues.debt, userLoanState?.debt) ? 'too-much-state' : ''
            if (!cFormValues.debtError) {
              cFormValues.debtError = helpers.isTooMuch(cFormValues.debt, userBalances?.borrowed)
                ? 'too-much-wallet'
                : ''
            }
            get()[sliceKey].setStateByKey('formValues', cloneDeep(cFormValues))
          }

          // api calls
          get()[sliceKey].fetchDetailInfo(activeKey, api, owmData)
          get()[sliceKey].fetchEstGasApproval(activeKey, api, owmData)
        }
      }
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
      const { debt, isFullRepay } = formValues
      const resp = await apiLending.loanRepay.approve(activeKey, provider, owmData, debt, isFullRepay)

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
    fetchStepDecrease: async (activeKey, api, owmData) => {
      const provider = get().wallet.getProvider(sliceKey)

      if (!provider) return

      // update formStatus
      const partialFormStatus: Partial<FormStatus> = { isInProgress: true, step: 'REPAY' }
      get()[sliceKey].setStateByKey('formStatus', merge(cloneDeep(get()[sliceKey].formStatus), partialFormStatus))

      await get().gas.fetchGasInfo(api)
      const { debt, isFullRepay } = get()[sliceKey].formValues
      const resp = await apiLending.loanRepay.repay(activeKey, provider, owmData, debt, isFullRepay)

      if (activeKey === get()[sliceKey].activeKey) {
        // api calls
        const loanExists = (await get().user.fetchUserLoanExists(api, owmData, true))?.loanExists
        if (loanExists) {
          get().user.fetchAll(api, owmData, true)
        } else {
          get().user.fetchUserMarketBalances(api, owmData, true)
          const userActiveKey = helpers.getUserActiveKey(api, owmData)
          get().user.setStateByActiveKey('loansDetailsMapper', userActiveKey, undefined)
        }
        get().markets.fetchAll(api, owmData, true)

        // update formStatus
        const partialFormStatus: Partial<FormStatus> = { error: resp.error, isApproved: true, isComplete: !resp.error }
        get()[sliceKey].setStateByKeys(merge(cloneDeep(DEFAULT_STATE), { formStatus: partialFormStatus }))

        return { ...resp, loanExists }
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

export function _getActiveKey(api: Api | null, owmData: OWMData | undefined, debt: string, isFullRepay: boolean) {
  return `${api?.chainId ?? ''}-${owmData?.owm?.id}-${debt}-${isFullRepay}`
}

export default createLoanRepaySlice
