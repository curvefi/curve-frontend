import type { GetState, SetState } from 'zustand'
import type { State } from '@lend/store/useStore'
import type { FormEstGas } from '@lend/components/PageLoanManage/types'
import type { FormStatus, FormValues } from '@lend/components/PageVault/VaultWithdrawRedeem/types'

import cloneDeep from 'lodash/cloneDeep'
import merge from 'lodash/merge'

import { DEFAULT_FORM_EST_GAS } from '@lend/components/PageLoanManage/utils'
import { DEFAULT_FORM_STATUS, DEFAULT_FORM_VALUES } from '@lend/components/PageVault/VaultWithdrawRedeem/utils'
import { _getMaxActiveKey } from '@lend/store/createVaultDepositMintSlice'
import apiLending, { helpers } from '@lend/lib/apiLending'
import { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'
import { Api, ChainId, FutureRates } from '@lend/types/lend.types'
import { setMissingProvider, useWallet } from '@ui-kit/features/connect-wallet'

type StateKey = keyof typeof DEFAULT_STATE
type FormType = string | null

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

const createVaultWithdrawRedeem = (set: SetState<State>, get: GetState<State>): VaultWithdrawRedeemSlice => ({
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
    fetchEstGas: async (activeKey, formType, api, market) => {
      const { signerAddress } = api
      const { amount, amountError, isFullWithdraw } = get()[sliceKey].formValues

      if (!signerAddress || (!isFullWithdraw && +amount <= 0) || amountError) return

      get()[sliceKey].setStateByKey('formEstGas', { [activeKey]: { ...DEFAULT_FORM_EST_GAS, loading: true } })
      await get().gas.fetchGasInfo(api)

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
      get()[sliceKey].fetchDetails(activeKey, formType, api, market)
      get()[sliceKey].fetchEstGas(activeKey, formType, api, market)
    },

    // steps
    fetchStepWithdrawRedeem: async (activeKey, formType: FormType, api, market, formValues, vaultShares) => {
      const { provider } = useWallet.state
      if (!provider) return setMissingProvider(get()[sliceKey])

      // update formStatus
      const partialFormStatus: Partial<FormStatus> = { isInProgress: true, step: 'WITHDRAW_REDEEM' }
      get()[sliceKey].setStateByKey('formStatus', merge(cloneDeep(get()[sliceKey].formStatus), partialFormStatus))

      // api calls
      await get().gas.fetchGasInfo(api)
      const { amount, isFullWithdraw } = formValues
      const resp = await apiLending.vaultWithdraw.withdraw(
        activeKey,
        provider,
        market,
        isFullWithdraw,
        amount,
        vaultShares,
      )

      if (resp.activeKey === get()[sliceKey].activeKey) {
        // api calls
        get().user.fetchUserMarketBalances(api, market, true)
        get()[sliceKey].fetchMax(api, formType, market)

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
    setStateByKeys: <T>(sliceState: Partial<SliceState>) => {
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
