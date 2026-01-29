import lodash from 'lodash'
import type { StoreApi } from 'zustand'
import type { FormEstGas } from '@/lend/components/PageLendMarket/types'
import { DEFAULT_FORM_EST_GAS, DEFAULT_FORM_STATUS as FORM_STATUS } from '@/lend/components/PageLendMarket/utils'
import type { FormStatus, FormValues } from '@/lend/components/PageVault/VaultStake/types'
import { DEFAULT_FORM_STATUS, DEFAULT_FORM_VALUES } from '@/lend/components/PageVault/VaultStake/utils'
import { refetchUserMarket } from '@/lend/entities/user-loan-details'
import { helpers, apiLending } from '@/lend/lib/apiLending'
import { networks } from '@/lend/networks'
import type { State } from '@/lend/store/useStore'
import { Api, ChainId, OneWayMarketTemplate } from '@/lend/types/lend.types'
import { updateUserEventsApi } from '@/llamalend/llama.utils'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { setMissingProvider } from '@ui-kit/utils/store.util'

type StateKey = keyof typeof DEFAULT_STATE
type FormType = string | null
const { merge, cloneDeep } = lodash

const sliceKey = 'vaultStake'

type SliceState = {
  activeKey: string
  formEstGas: { [activeKey: string]: FormEstGas }
  formStatus: FormStatus
  formValues: FormValues
}

// prettier-ignore
export type VaultStakeSlice = {
  [sliceKey]: SliceState & {
    fetchEstGasApproval(activeKey: string, formType: FormType, api: Api, market: OneWayMarketTemplate): Promise<void>
    setFormValues(rChainId: ChainId, formType: FormType, api: Api | null, market: OneWayMarketTemplate | undefined, updatedPartialFormValues: Partial<FormValues>): Promise<void>

    // steps
    fetchStepApprove(activeKey: string, formType: FormType, api: Api, market: OneWayMarketTemplate, formValues: FormValues): Promise<{ hashes: string[]; activeKey: string; error: string } | undefined>
    fetchStepStake(activeKey: string, formType: FormType, api: Api, market: OneWayMarketTemplate, formValues: FormValues): Promise<{ activeKey: string; error: string; hash: string } | undefined>

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

export const createVaultStake = (
  _set: StoreApi<State>['setState'],
  get: StoreApi<State>['getState'],
): VaultStakeSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchEstGasApproval: async (activeKey, _formType, api, market) => {
      const { signerAddress } = api
      const { amount, amountError } = get()[sliceKey].formValues

      if (!signerAddress || +amount <= 0 || amountError) return

      get()[sliceKey].setStateByKey('formEstGas', { [activeKey]: { ...DEFAULT_FORM_EST_GAS, loading: true } })
      const resp = await apiLending.vaultStake.estGasApproval(activeKey, market, amount)
      get()[sliceKey].setStateByKey('formEstGas', { [resp.activeKey]: { estimatedGas: resp.estimatedGas } })

      // update formStatus
      const cFormStatus = cloneDeep(get()[sliceKey].formStatus)
      cFormStatus.isApproved = resp.isApproved
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
        cFormValues.amountError = helpers.isTooMuch(cFormValues.amount, userBalancesResp?.vaultShares)
          ? 'too-much-wallet'
          : ''
        get()[sliceKey].setStateByKeys({ activeKey, formValues: cFormValues })
      }

      // api calls
      if (signerAddress) {
        void get()[sliceKey].fetchEstGasApproval(activeKey, formType, api, market)
      }
    },

    // steps
    fetchStepApprove: async (activeKey, formType, api, market, formValues) => {
      const { provider } = useWallet.getState()
      if (!provider) return setMissingProvider(get()[sliceKey])

      // update formStatus
      const partialFormStatus: Partial<FormStatus> = { isInProgress: true, step: 'APPROVAL' }
      get()[sliceKey].setStateByKey('formStatus', merge(cloneDeep(get()[sliceKey].formStatus), partialFormStatus))

      const { amount } = formValues
      const resp = await apiLending.vaultStake.approve(activeKey, provider, market, amount)

      if (resp.activeKey === get()[sliceKey].activeKey) {
        // update formStatus
        const partialFormStatus: Partial<FormStatus> = {
          error: resp.error,
          isApproved: !resp.error,
          isInProgress: true,
        }
        get()[sliceKey].setStateByKey('formStatus', merge(cloneDeep(FORM_STATUS), partialFormStatus))
        if (!resp.error) void get()[sliceKey].fetchEstGasApproval(activeKey, formType, api, market)
        return resp
      }
    },
    fetchStepStake: async (activeKey, _formType, api, market, formValues) => {
      const { provider, wallet } = useWallet.getState()
      const { chainId } = api
      if (!provider || !wallet) return setMissingProvider(get()[sliceKey])

      // update formStatus
      const partialFormStatus: Partial<FormStatus> = { isInProgress: true, step: 'STAKE' }
      get()[sliceKey].setStateByKey('formStatus', merge(cloneDeep(get()[sliceKey].formStatus), partialFormStatus))

      // api calls
      const { amount } = formValues
      const resp = await apiLending.vaultStake.stake(activeKey, provider, market, amount)
      updateUserEventsApi(wallet, networks[chainId], market, resp.hash)

      if (resp.activeKey === get()[sliceKey].activeKey) {
        // re-fetch api
        await refetchUserMarket({ api, market })
        void get().user.fetchUserMarketBalances(api, market, true)

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
    setStateByKeys: (sliceState: Partial<SliceState>) => {
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
