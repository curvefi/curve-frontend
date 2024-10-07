
import cloneDeep from 'lodash/cloneDeep'
import merge from 'lodash/merge'
import type { GetState, SetState } from 'zustand'
import type { FormEstGas } from '@/components/PageLoanManage/types'
import type { FormStatus, RewardType } from '@/components/PageVault/VaultClaim/types'

import { DEFAULT_FORM_STATUS } from '@/components/PageVault/VaultClaim/utils'
import apiLending from '@/lib/apiLending'
import type { State } from '@/store/useStore'

type StateKey = keyof typeof DEFAULT_STATE

const sliceKey = 'vaultClaim'

type SliceState = {
  claimable: { [userActiveKey: string]: MarketClaimable }
  formEstGas: { [userActiveKey: string]: FormEstGas }
  formStatus: FormStatus
}

// prettier-ignore
export type VaultClaimSlice = {
  [sliceKey]: SliceState & {
    fetchClaimable(userActiveKey: string, api: Api, owmData: OWMData): Promise<void>
    setFormValues(userActiveKey: string, api: Api | null, owmData: OWMData | undefined): Promise<void>

    // steps
    fetchStepClaim(userActiveKey: string, api: Api, owmData: OWMData, type: RewardType): Promise<{ userActiveKey: string; error: string; hash: string } | undefined>

    // steps helper
    setStateByActiveKey<T>(key: StateKey, userActiveKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  claimable: {},
  formEstGas: {},
  formStatus: DEFAULT_FORM_STATUS,
}

const createVaultClaim = (set: SetState<State>, get: GetState<State>): VaultClaimSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchClaimable: async (userActiveKey, api, owmData) => {
      const { signerAddress } = api

      if (!signerAddress) return

      const resp = await apiLending.vaultClaim.claimable(userActiveKey, owmData)
      get()[sliceKey].setStateByKey('claimable', { [resp.userActiveKey]: { claimable: resp.claimable } })
    },
    setFormValues: async (userActiveKey, api, owmData) => {
      // update userActiveKey, formValues
      const cFormStatus: FormStatus = cloneDeep(DEFAULT_FORM_STATUS)
      get()[sliceKey].setStateByKeys({ formStatus: cFormStatus })

      if (!userActiveKey || !api || !owmData) return

      const { signerAddress } = api

      // api calls
      if (signerAddress) {
        get()[sliceKey].fetchClaimable(userActiveKey, api, owmData)
      }
    },

    // steps
    fetchStepClaim: async (userActiveKey, api, owmData, type) => {
      const provider = get().wallet.getProvider(sliceKey)

      if (!provider) return

      // update formStatus
      const step = type === 'crv' ? 'CLAIM_CRV' : 'CLAIM_REWARDS'
      const partialFormStatus: Partial<FormStatus> = { isInProgress: true, step, isComplete: false }
      get()[sliceKey].setStateByKey('formStatus', merge(cloneDeep(get()[sliceKey].formStatus), partialFormStatus))

      // api calls
      await get().gas.fetchGasInfo(api)
      const fn = type === 'crv' ? apiLending.vaultClaim.claimCrv : apiLending.vaultClaim.claimRewards
      const resp = await fn(userActiveKey, provider, owmData)

      if (resp.userActiveKey === userActiveKey) {
        // re-fetch api
        get()[sliceKey].fetchClaimable(resp.userActiveKey, api, owmData)
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
    setStateByActiveKey: <T>(key: StateKey, userActiveKey: string, value: T) => {
      if (Object.keys(get()[sliceKey][key] ?? {}).length > 30) {
        get().setAppStateByKey(sliceKey, key, { [userActiveKey]: value })
      } else {
        get().setAppStateByActiveKey(sliceKey, key, userActiveKey, value)
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

export default createVaultClaim
