import type { GetState, SetState } from 'zustand'
import type { State } from '@lend/store/useStore'
import type { FormEstGas } from '@lend/components/PageLoanManage/types'
import type { FormStatus, FormValues } from '@lend/components/PageVault/VaultUnstake/types'

import cloneDeep from 'lodash/cloneDeep'
import merge from 'lodash/merge'

import { DEFAULT_FORM_EST_GAS } from '@lend/components/PageLoanManage/utils'
import { DEFAULT_FORM_STATUS, DEFAULT_FORM_VALUES } from '@lend/components/PageVault/VaultUnstake/utils'
import apiLending, { helpers } from '@lend/lib/apiLending'
import { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'
import { ChainId, Api } from '@lend/types/lend.types'
import { setMissingProvider, useWallet } from '@ui-kit/features/connect-wallet'

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
    fetchEstGas(activeKey: string, formType: FormType, api: Api, market: OneWayMarketTemplate): Promise<void>
    setFormValues(rChainId: ChainId, formType: FormType, api: Api | null, market: OneWayMarketTemplate | undefined, updatedPartialFormValues: Partial<FormValues>): Promise<void>

    // steps
    fetchStepUnstake(activeKey: string, formType: FormType, api: Api, market: OneWayMarketTemplate, formValues: FormValues): Promise<{ activeKey: string; error: string; hash: string } | undefined>

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

    fetchEstGas: async (activeKey, formType, api, market) => {
      const { signerAddress } = api
      const { amount, amountError } = get()[sliceKey].formValues

      if (!signerAddress || +amount <= 0 || amountError) return

      get()[sliceKey].setStateByKey('formEstGas', { [activeKey]: { ...DEFAULT_FORM_EST_GAS, loading: true } })
      await get().gas.fetchGasInfo(api)
      const resp = await apiLending.vaultUnstake.estGas(activeKey, market, amount)
      get()[sliceKey].setStateByKey('formEstGas', { [resp.activeKey]: { estimatedGas: resp.estimatedGas } })

      // update formStatus
      const cFormStatus = cloneDeep(get()[sliceKey].formStatus)
      cFormStatus.error = cFormStatus.error || resp.error
      get()[sliceKey].setStateByKey('formStatus', cFormStatus)
    },
    setFormValues: async (rChainId, formType, api, market, partialFormValues) => {
      const storedFormStatus = get()[sliceKey].formStatus
      const storedFormValues = get()[sliceKey].formValues

      // update activeKey, formValues
      const cFormValues: FormValues = cloneDeep({ ...storedFormValues, ...partialFormValues, amountError: '' })
      const cFormStatus: FormStatus = cloneDeep({ ...DEFAULT_FORM_STATUS, isApproved: storedFormStatus.isApproved })
      const activeKey = _getActiveKey(rChainId, formType, market, cFormValues)
      get()[sliceKey].setStateByKeys({ activeKey, formValues: cloneDeep(cFormValues), formStatus: cFormStatus })

      if (!api || !market) return

      const { signerAddress } = api

      // validation
      if (signerAddress) {
        const userBalancesResp = await get().user.fetchUserMarketBalances(api, market, true)
        cFormValues.amountError = helpers.isTooMuch(cFormValues.amount, userBalancesResp?.gauge)
          ? 'too-much-wallet'
          : ''
        get()[sliceKey].setStateByKeys({ activeKey, formValues: cFormValues })
      }

      // api calls
      if (signerAddress) {
        get()[sliceKey].fetchEstGas(activeKey, formType, api, market)
      }
    },

    // steps
    fetchStepUnstake: async (activeKey, formType, api, market, formValues) => {
      const { provider } = useWallet.state
      if (!provider) return setMissingProvider(get()[sliceKey])

      // update formStatus
      const partialFormStatus: Partial<FormStatus> = { isInProgress: true, step: 'UNSTAKE' }
      get()[sliceKey].setStateByKey('formStatus', merge(cloneDeep(get()[sliceKey].formStatus), partialFormStatus))

      // api calls
      await get().gas.fetchGasInfo(api)
      const { amount } = formValues
      const resp = await apiLending.vaultUnstake.unstake(activeKey, provider, market, amount)

      if (resp.activeKey === get()[sliceKey].activeKey) {
        // re-fetch api
        get().user.fetchUserMarketBalances(api, market, true)
        get().markets.fetchAll(api, market, true)

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
  market: OneWayMarketTemplate | undefined,
  { amount }: FormValues,
) {
  return `${rChainId}-${formType}-${market?.id ?? ''}-${amount}`
}

export default createVaultUnstake
