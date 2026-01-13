import lodash from 'lodash'
import type { StoreApi } from 'zustand'
import type { FormEstGas } from '@/lend/components/PageLendMarket/types'
import type { FormStatus, RewardType } from '@/lend/components/PageVault/VaultClaim/types'
import { DEFAULT_FORM_STATUS } from '@/lend/components/PageVault/VaultClaim/utils'
import { apiLending } from '@/lend/lib/apiLending'
import type { State } from '@/lend/store/useStore'
import { Api, MarketClaimable, OneWayMarketTemplate } from '@/lend/types/lend.types'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { setMissingProvider } from '@ui-kit/utils/store.util'

type StateKey = keyof typeof DEFAULT_STATE
const { cloneDeep, merge } = lodash

const sliceKey = 'vaultClaim'

type SliceState = {
  claimable: { [userActiveKey: string]: MarketClaimable }
  formEstGas: { [userActiveKey: string]: FormEstGas }
  formStatus: FormStatus
}

// prettier-ignore
export type VaultClaimSlice = {
  [sliceKey]: SliceState & {
    fetchClaimable(userActiveKey: string, api: Api, market: OneWayMarketTemplate): Promise<void>
    setFormValues(userActiveKey: string, api: Api | null, market: OneWayMarketTemplate | undefined): Promise<void>

    // steps
    fetchStepClaim(userActiveKey: string, api: Api, market: OneWayMarketTemplate, type: RewardType): Promise<{ userActiveKey: string; error: string; hash: string } | undefined>

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

export const createVaultClaim = (_set: StoreApi<State>['setState'], get: StoreApi<State>['getState']): VaultClaimSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchClaimable: async (userActiveKey, api, market) => {
      const { signerAddress } = api

      if (!signerAddress) return

      const resp = await apiLending.vaultClaim.claimable(userActiveKey, market)
      get()[sliceKey].setStateByKey('claimable', { [resp.userActiveKey]: { claimable: resp.claimable } })
    },
    setFormValues: async (userActiveKey, api, market) => {
      // update userActiveKey, formValues
      const cFormStatus: FormStatus = cloneDeep(DEFAULT_FORM_STATUS)
      get()[sliceKey].setStateByKeys({ formStatus: cFormStatus })

      if (!userActiveKey || !api || !market) return

      const { signerAddress } = api

      // api calls
      if (signerAddress) {
        void get()[sliceKey].fetchClaimable(userActiveKey, api, market)
      }
    },

    // steps
    fetchStepClaim: async (userActiveKey, api, market, type) => {
      const { provider } = useWallet.getState()
      if (!provider) return setMissingProvider(get()[sliceKey])

      // update formStatus
      const step = type === 'crv' ? 'CLAIM_CRV' : 'CLAIM_REWARDS'
      const partialFormStatus: Partial<FormStatus> = { isInProgress: true, step, isComplete: false }
      get()[sliceKey].setStateByKey('formStatus', merge(cloneDeep(get()[sliceKey].formStatus), partialFormStatus))

      // api calls
      const fn = type === 'crv' ? apiLending.vaultClaim.claimCrv : apiLending.vaultClaim.claimRewards
      const resp = await fn(userActiveKey, provider, market)

      if (resp.userActiveKey === userActiveKey) {
        // re-fetch api
        void get()[sliceKey].fetchClaimable(resp.userActiveKey, api, market)
        void get().user.fetchUserMarketBalances(api, market, true)
        void get().markets.fetchAll(api, market, true)

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
    setStateByKeys: (sliceState: Partial<SliceState>) => {
      get().setAppStateByKeys(sliceKey, sliceState)
    },
    resetState: () => {
      get().resetAppState(sliceKey, cloneDeep(DEFAULT_STATE))
    },
  },
})
