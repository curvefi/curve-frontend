import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type { FormEstGas } from '@/components/PageLoanManage/types'
import type { FormStatus, FormValues } from '@/components/PageVault/VaultUnstake/types'

import cloneDeep from 'lodash/cloneDeep'
import merge from 'lodash/merge'

import { DEFAULT_FORM_EST_GAS, DEFAULT_FORM_STATUS as FORM_STATUS } from '@/components/PageLoanManage/utils'
import { DEFAULT_FORM_STATUS, DEFAULT_FORM_VALUES } from '@/components/PageVault/VaultUnstake/utils'
import apiLending, { helpers } from '@/lib/apiLending'

type StateKey = keyof typeof DEFAULT_STATE
type FormType = string | null

const sliceKey = 'vaultUnstake'

type SliceState = {
  activeKey: string
  formEstGas: { [activeKey: string]: FormEstGas }
  formStatus: FormStatus
  formValues: FormValues
}

// prettier-ignore
export type VaultUnstakeSlice = {
  [sliceKey]: SliceState & {
    fetchEstGas(activeKey: string, formType: FormType, api: Api, owmData: OWMData): Promise<void>
    setFormValues(rChainId: ChainId, formType: FormType, api: Api | null, owmData: OWMData | undefined, updatedPartialFormValues: Partial<FormValues>): Promise<void>

    // steps
    fetchStepUnstake(activeKey: string, formType: FormType, api: Api, owmData: OWMData, formValues: FormValues): Promise<{ activeKey: string; error: string; hash: string } | undefined>

    // steps helper
    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  activeKey: '',
  formEstGas: {},
  formStatus: DEFAULT_FORM_STATUS,
  formValues: DEFAULT_FORM_VALUES,
}

const createVaultUnstake = (set: SetState<State>, get: GetState<State>): VaultUnstakeSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchEstGas: async (activeKey, formType, api, owmData) => {
      const { signerAddress } = api
      const { amount, amountError } = get()[sliceKey].formValues

      if (!signerAddress || +amount <= 0 || amountError) return

      get()[sliceKey].setStateByKey('formEstGas', { [activeKey]: { ...DEFAULT_FORM_EST_GAS, loading: true } })
      await get().gas.fetchGasInfo(api)
      const resp = await apiLending.vaultUnstake.estGas(activeKey, owmData, amount)
      get()[sliceKey].setStateByKey('formEstGas', { [resp.activeKey]: { estimatedGas: resp.estimatedGas } })

      // update formStatus
      const cFormStatus = cloneDeep(get()[sliceKey].formStatus)
      cFormStatus.error = cFormStatus.error || resp.error
      get()[sliceKey].setStateByKey('formStatus', cFormStatus)
    },
    setFormValues: async (rChainId, formType, api, owmData, partialFormValues) => {
      const storedFormStatus = get()[sliceKey].formStatus
      const storedFormValues = get()[sliceKey].formValues

      // update activeKey, formValues
      const cFormValues: FormValues = cloneDeep({ ...storedFormValues, ...partialFormValues, amountError: '' })
      const cFormStatus: FormStatus = cloneDeep({ ...DEFAULT_FORM_STATUS, isApproved: storedFormStatus.isApproved })
      const activeKey = _getActiveKey(rChainId, formType, owmData, cFormValues)
      get()[sliceKey].setStateByKeys({ activeKey, formValues: cloneDeep(cFormValues), formStatus: cFormStatus })

      if (!api || !owmData) return

      const { signerAddress } = api

      // validation
      if (signerAddress) {
        const userBalancesResp = await get().user.fetchUserMarketBalances(api, owmData, true)
        cFormValues.amountError = helpers.isTooMuch(cFormValues.amount, userBalancesResp?.gauge)
          ? 'too-much-wallet'
          : ''
        get()[sliceKey].setStateByKeys({ activeKey, formValues: cFormValues })
      }

      // api calls
      if (signerAddress) {
        get()[sliceKey].fetchEstGas(activeKey, formType, api, owmData)
      }
    },

    // steps
    fetchStepUnstake: async (activeKey, formType, api, owmData, formValues) => {
      const provider = get().wallet.getProvider(sliceKey)

      if (!provider) return

      // update formStatus
      const partialFormStatus: Partial<FormStatus> = { isInProgress: true, step: 'UNSTAKE' }
      get()[sliceKey].setStateByKey('formStatus', merge(cloneDeep(get()[sliceKey].formStatus), partialFormStatus))

      // api calls
      await get().gas.fetchGasInfo(api)
      const { amount } = formValues
      const resp = await apiLending.vaultUnstake.unstake(activeKey, provider, owmData, amount)

      if (resp.activeKey === get()[sliceKey].activeKey) {
        // re-fetch api
        get().user.fetchUserMarketBalances(api, owmData, true)
        get().markets.fetchAll(api, owmData, true)

        // update state
        const partialFormStatus: Partial<FormStatus> = {
          error: resp.error,
          isApproved: true,
          isComplete: !resp.error,
        }
        get()[sliceKey].setStateByKeys(merge(cloneDeep(DEFAULT_STATE), { formStatus: partialFormStatus }))

        return { ...resp }
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
  formType: FormType | null,
  owmData: OWMData | undefined,
  { amount }: FormValues
) {
  return `${rChainId}-${formType}-${owmData?.owm?.id ?? ''}-${amount}`
}

export default createVaultUnstake
