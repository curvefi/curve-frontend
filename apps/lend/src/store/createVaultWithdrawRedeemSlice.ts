
import cloneDeep from 'lodash/cloneDeep'
import merge from 'lodash/merge'
import type { GetState, SetState } from 'zustand'
import type { FormEstGas } from '@/components/PageLoanManage/types'

import { DEFAULT_FORM_EST_GAS } from '@/components/PageLoanManage/utils'
import type { FormStatus, FormValues } from '@/components/PageVault/VaultWithdrawRedeem/types'
import { DEFAULT_FORM_STATUS, DEFAULT_FORM_VALUES } from '@/components/PageVault/VaultWithdrawRedeem/utils'
import apiLending, { helpers } from '@/lib/apiLending'
import { _getMaxActiveKey } from '@/store/createVaultDepositMintSlice'
import type { State } from '@/store/useStore'

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
    fetchMax(api: Api, formType: FormType, owmData: OWMData): Promise<void>
    fetchEstGas(activeKey: string, formType: FormType, api: Api, owmData: OWMData): Promise<void>
    fetchDetails(activeKey: string, formType: FormType, api: Api, owmData: OWMData): Promise<void>
    setFormValues(rChainId: ChainId, formType: FormType, api: Api | null, owmData: OWMData | undefined, updatedPartialFormValues: Partial<FormValues>): Promise<void>

    // steps
    fetchStepWithdrawRedeem(activeKey: string, formType: FormType, api: Api, owmData: OWMData, formValues: FormValues, vaultShares: string): Promise<{ activeKey: string; error: string; hash: string } | undefined>

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

    fetchMax: async (api, formType: FormType, owmData) => {
      const { chainId, signerAddress } = api

      if (!signerAddress) return

      const resp = _isWithdraw(formType)
        ? await apiLending.vaultWithdraw.max(owmData)
        : await apiLending.vaultRedeem.max(owmData)
      const activeKey = _getMaxActiveKey(chainId, formType, owmData)
      get()[sliceKey].setStateByActiveKey('max', activeKey, resp)

      // validation
      const cFormValues = cloneDeep(get()[sliceKey].formValues)
      cFormValues.amountError = helpers.isTooMuch(cFormValues.amount, resp.max)
        ? 'too-much-max'
        : cFormValues.amountError
      get()[sliceKey].setStateByKey('formValues', cFormValues)
    },
    fetchEstGas: async (activeKey, formType, api, owmData) => {
      const { signerAddress } = api
      const { amount, amountError, isFullWithdraw } = get()[sliceKey].formValues

      if (!signerAddress || (!isFullWithdraw && +amount <= 0) || amountError) return

      get()[sliceKey].setStateByKey('formEstGas', { [activeKey]: { ...DEFAULT_FORM_EST_GAS, loading: true } })
      await get().gas.fetchGasInfo(api)

      let resp
      if (isFullWithdraw) {
        const { vaultShares } = await owmData.owm.wallet.balances()
        resp = await apiLending.vaultRedeem.estGas(activeKey, owmData, vaultShares)
      } else {
        resp = await apiLending.vaultWithdraw.estGas(activeKey, owmData, amount)
      }
      get()[sliceKey].setStateByKey('formEstGas', { [resp.activeKey]: { estimatedGas: resp.estimatedGas } })

      // update formStatus
      const cFormStatus = cloneDeep(get()[sliceKey].formStatus)
      cFormStatus.error = cFormStatus.error || resp.error || ''
      get()[sliceKey].setStateByKey('formStatus', cFormStatus)
    },
    fetchDetails: async (activeKey, formType, api, owmData) => {
      const { signerAddress } = api
      const { amount, amountError } = get()[sliceKey].formValues

      if (!signerAddress || +amount <= 0 || amountError) return

      const fn = _isWithdraw(formType) ? apiLending.vaultWithdraw.detailInfo : apiLending.vaultRedeem.detailInfo
      const resp = await fn(activeKey, owmData, amount)
      get()[sliceKey].setStateByActiveKey('detailInfo', resp.activeKey, resp)
    },
    setFormValues: async (rChainId, formType, api, owmData, partialFormValues) => {
      const storedFormValues = get()[sliceKey].formValues

      // update activeKey and formValues
      const cFormValues: FormValues = cloneDeep({ ...storedFormValues, ...partialFormValues, amountError: '' })
      const cFormStatus: FormStatus = cloneDeep({ ...DEFAULT_FORM_STATUS })
      const activeKey = _getActiveKey(rChainId, formType, owmData, cFormValues)
      get()[sliceKey].setStateByKeys({ activeKey, formValues: cloneDeep(cFormValues), formStatus: cFormStatus })

      if (!api || !owmData) return

      // api calls
      await get()[sliceKey].fetchMax(api, formType, owmData)
      get()[sliceKey].fetchDetails(activeKey, formType, api, owmData)
      get()[sliceKey].fetchEstGas(activeKey, formType, api, owmData)
    },

    // steps
    fetchStepWithdrawRedeem: async (activeKey, formType: FormType, api, owmData, formValues, vaultShares) => {
      const provider = get().wallet.getProvider(sliceKey)

      if (!provider) return

      // update formStatus
      const partialFormStatus: Partial<FormStatus> = { isInProgress: true, step: 'WITHDRAW_REDEEM' }
      get()[sliceKey].setStateByKey('formStatus', merge(cloneDeep(get()[sliceKey].formStatus), partialFormStatus))

      // api calls
      await get().gas.fetchGasInfo(api)
      const { amount, isFullWithdraw } = formValues
      const resp = await apiLending.vaultWithdraw.withdraw(
        activeKey,
        provider,
        owmData,
        isFullWithdraw,
        amount,
        vaultShares
      )

      if (resp.activeKey === get()[sliceKey].activeKey) {
        // api calls
        get().user.fetchUserMarketBalances(api, owmData, true)
        get()[sliceKey].fetchMax(api, formType, owmData)

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
  owmData: OWMData | undefined,
  { amount }: FormValues
) {
  return `${rChainId}-${formType}-${owmData?.owm?.id ?? ''}-${amount}`
}

export default createVaultWithdrawRedeem
