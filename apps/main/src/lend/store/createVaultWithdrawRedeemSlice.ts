import lodash from 'lodash'
import type { StoreApi } from 'zustand'
import type { FormEstGas } from '@/lend/components/PageLendMarket/types'
import { DEFAULT_FORM_EST_GAS } from '@/lend/components/PageLendMarket/utils'
import type { FormStatus, FormValues } from '@/lend/components/PageVault/VaultWithdrawRedeem/types'
import { DEFAULT_FORM_STATUS, DEFAULT_FORM_VALUES } from '@/lend/components/PageVault/VaultWithdrawRedeem/utils'
import { invalidateAllUserBorrowDetails } from '@/lend/entities/user-loan-details'
import apiLending, { helpers } from '@/lend/lib/apiLending'
import networks from '@/lend/networks'
import { _getMaxActiveKey } from '@/lend/store/createVaultDepositMintSlice'
import type { State } from '@/lend/store/useStore'
import { Api, ChainId, FutureRates, OneWayMarketTemplate } from '@/lend/types/lend.types'
import { updateUserEventsApi } from '@/llamalend/llama.utils'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { setMissingProvider } from '@ui-kit/utils/store.util'

type StateKey = keyof typeof DEFAULT_STATE
type FormType = string | null
const { cloneDeep, merge } = lodash

const sliceKey = 'vaultWithdrawRedeem'

type SliceState = {
  activeKey: string
  formEstGas: { [activeKey: string]: FormEstGas }
  max: { [formTypeChainIdOwmId: string]: { max: string; error: string } }
  detailInfo: { [activeKey: string]: { preview: string; futureRates: FutureRates | null; error: string } }
  formStatus: FormStatus
  formValues: FormValues
}

// prettier-ignore
export type VaultWithdrawRedeemSlice = {
  [sliceKey]: SliceState & {
    fetchMax(api: Api, formType: FormType, market: OneWayMarketTemplate): Promise<void>
    fetchEstGas(activeKey: string, formType: FormType, api: Api, market: OneWayMarketTemplate): Promise<void>
    fetchDetails(activeKey: string, formType: FormType, api: Api, market: OneWayMarketTemplate): Promise<void>
    setFormValues(rChainId: ChainId, formType: FormType, api: Api | null, market: OneWayMarketTemplate | undefined, updatedPartialFormValues: Partial<FormValues>): Promise<void>

    // steps
    fetchStepWithdrawRedeem(activeKey: string, formType: FormType, api: Api, market: OneWayMarketTemplate, formValues: FormValues, vaultShares: string): Promise<{ activeKey: string; error: string; hash: string } | undefined>

    // steps helper
    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void

    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(isLeverage?: boolean): void
  }
}

const DEFAULT_STATE: SliceState = {
  activeKey: '',
  formEstGas: {},
  max: {},
  detailInfo: {},
  formStatus: DEFAULT_FORM_STATUS,
  formValues: DEFAULT_FORM_VALUES,
}

const createVaultWithdrawRedeem = (
  _set: StoreApi<State>['setState'],
  get: StoreApi<State>['getState'],
): VaultWithdrawRedeemSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchMax: async (api, formType: FormType, market) => {
      const { chainId, signerAddress } = api

      if (!signerAddress) return

      const resp = _isWithdraw(formType)
        ? await apiLending.vaultWithdraw.max(market)
        : await apiLending.vaultRedeem.max(market)
      const activeKey = _getMaxActiveKey(chainId, formType, market)
      get()[sliceKey].setStateByActiveKey('max', activeKey, resp)

      // validation
      const cFormValues = cloneDeep(get()[sliceKey].formValues)
      cFormValues.amountError = helpers.isTooMuch(cFormValues.amount, resp.max)
        ? 'too-much-max'
        : cFormValues.amountError
      get()[sliceKey].setStateByKey('formValues', cFormValues)
    },
    fetchEstGas: async (activeKey, _formType, api, market) => {
      const { signerAddress } = api
      const { amount, amountError, isFullWithdraw } = get()[sliceKey].formValues

      if (!signerAddress || (!isFullWithdraw && +amount <= 0) || amountError) return

      get()[sliceKey].setStateByKey('formEstGas', { [activeKey]: { ...DEFAULT_FORM_EST_GAS, loading: true } })

      let resp
      if (isFullWithdraw) {
        const { vaultShares } = await market.wallet.balances()
        resp = await apiLending.vaultRedeem.estGas(activeKey, market, vaultShares)
      } else {
        resp = await apiLending.vaultWithdraw.estGas(activeKey, market, amount)
      }
      get()[sliceKey].setStateByKey('formEstGas', { [resp.activeKey]: { estimatedGas: resp.estimatedGas } })

      // update formStatus
      const cFormStatus = cloneDeep(get()[sliceKey].formStatus)
      cFormStatus.error = cFormStatus.error || resp.error || ''
      get()[sliceKey].setStateByKey('formStatus', cFormStatus)
    },
    fetchDetails: async (activeKey, formType, api, market) => {
      const { signerAddress } = api
      const { amount, amountError } = get()[sliceKey].formValues

      if (!signerAddress || +amount <= 0 || amountError) return

      const fn = _isWithdraw(formType) ? apiLending.vaultWithdraw.detailInfo : apiLending.vaultRedeem.detailInfo
      const resp = await fn(activeKey, market, amount)
      get()[sliceKey].setStateByActiveKey('detailInfo', resp.activeKey, resp)
    },
    setFormValues: async (rChainId, formType, api, market, partialFormValues) => {
      const storedFormValues = get()[sliceKey].formValues

      // update activeKey and formValues
      const cFormValues: FormValues = cloneDeep({ ...storedFormValues, ...partialFormValues, amountError: '' })
      const cFormStatus: FormStatus = cloneDeep({ ...DEFAULT_FORM_STATUS })
      const activeKey = _getActiveKey(rChainId, formType, market, cFormValues)
      get()[sliceKey].setStateByKeys({ activeKey, formValues: cloneDeep(cFormValues), formStatus: cFormStatus })

      if (!api || !market) return

      // api calls
      await get()[sliceKey].fetchMax(api, formType, market)
      void get()[sliceKey].fetchDetails(activeKey, formType, api, market)
      void get()[sliceKey].fetchEstGas(activeKey, formType, api, market)
    },

    // steps
    fetchStepWithdrawRedeem: async (activeKey, formType: FormType, api, market, formValues, vaultShares) => {
      const { provider, wallet } = useWallet.getState()
      const { chainId } = api
      if (!provider || !wallet) return setMissingProvider(get()[sliceKey])

      // update formStatus
      const partialFormStatus: Partial<FormStatus> = { isInProgress: true, step: 'WITHDRAW_REDEEM' }
      get()[sliceKey].setStateByKey('formStatus', merge(cloneDeep(get()[sliceKey].formStatus), partialFormStatus))

      // api calls
      const { amount, isFullWithdraw } = formValues
      const resp = await apiLending.vaultWithdraw.withdraw(
        activeKey,
        provider,
        market,
        isFullWithdraw,
        amount,
        vaultShares,
      )
      updateUserEventsApi(wallet, networks[chainId], market, resp.hash)

      if (resp.activeKey === get()[sliceKey].activeKey) {
        // api calls
        void get().user.fetchUserMarketBalances(api, market, true)
        void get()[sliceKey].fetchMax(api, formType, market)
        invalidateAllUserBorrowDetails({ chainId: api.chainId, marketId: market.id })

        // update state
        const partialFormStatus: Partial<FormStatus> = { error: resp.error, isComplete: !resp.error }
        get()[sliceKey].setStateByKeys(merge(cloneDeep(DEFAULT_STATE), { formStatus: partialFormStatus }))

        return resp
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

export function _isWithdraw(formType: FormType) {
  return formType === 'withdraw'
}

export function _getActiveKey(
  rChainId: ChainId,
  formType: FormType,
  market: OneWayMarketTemplate | undefined,
  { amount }: FormValues,
) {
  return `${rChainId}-${formType}-${market?.id ?? ''}-${amount}`
}

export default createVaultWithdrawRedeem
