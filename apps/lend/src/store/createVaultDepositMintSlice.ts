import type { GetState, SetState } from 'zustand'
import type { State } from '@lend/store/useStore'
import type { FormEstGas } from '@lend/components/PageLoanManage/types'
import type { FormStatus, FormValues } from '@lend/components/PageVault/VaultDepositMint/types'

import cloneDeep from 'lodash/cloneDeep'
import merge from 'lodash/merge'

import { DEFAULT_FORM_EST_GAS, DEFAULT_FORM_STATUS as FORM_STATUS } from '@lend/components/PageLoanManage/utils'
import { DEFAULT_FORM_STATUS, DEFAULT_FORM_VALUES } from '@lend/components/PageVault/VaultDepositMint/utils'
import apiLending, { helpers } from '@lend/lib/apiLending'
import { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'
import { ChainId, Api, FutureRates } from '@lend/types/lend.types'

type StateKey = keyof typeof DEFAULT_STATE
type FormType = string | null

const sliceKey = 'vaultDepositMint'

type SliceState = {
  activeKey: string
  formEstGas: { [activeKey: string]: FormEstGas }
  max: { [formTypeChainIdOwmId: string]: { max: string; error: string } }
  detailInfo: { [activeKey: string]: { preview: string; futureRates: FutureRates | null; error: string } }
  formStatus: FormStatus
  formValues: FormValues
}

// prettier-ignore
export type VaultDepositMintSlice = {
  [sliceKey]: SliceState & {
    fetchMax(rChainId: ChainId, formType: FormType, market: OneWayMarketTemplate): Promise<void>
    fetchEstGasApproval(activeKey: string, formType: FormType, api: Api, market: OneWayMarketTemplate): Promise<void>
    fetchDetails(activeKey: string, formType: FormType, market: OneWayMarketTemplate): Promise<void>
    setFormValues(rChainId: ChainId, formType: FormType, api: Api | null, market: OneWayMarketTemplate | undefined, updatedPartialFormValues: Partial<FormValues>): Promise<void>

    // steps
    fetchStepApprove(activeKey: string, formType: FormType, api: Api, market: OneWayMarketTemplate, formValues: FormValues): Promise<{ hashes: string[]; activeKey: string; error: string } | undefined>
    fetchStepDepositMint(activeKey: string, formType: FormType, api: Api, market: OneWayMarketTemplate, formValues: FormValues): Promise<{ activeKey: string; error: string; hash: string } | undefined>

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

const createVaultMint = (set: SetState<State>, get: GetState<State>): VaultDepositMintSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchMax: async (rChainId, formType, market) => {
      const resp = _isDeposit(formType)
        ? await apiLending.vaultDeposit.max(market)
        : await apiLending.vaultMint.max(market)

      const activeKey = _getMaxActiveKey(rChainId, formType, market)
      get()[sliceKey].setStateByActiveKey('max', activeKey, resp)

      //   validation
      const cFormValues = cloneDeep(get()[sliceKey].formValues)
      cFormValues.amountError = helpers.isTooMuch(cFormValues.amount, resp.max)
        ? 'too-much-max'
        : cFormValues.amountError
      get()[sliceKey].setStateByKey('formValues', cFormValues)
    },
    fetchEstGasApproval: async (activeKey, formType, api, market) => {
      const { signerAddress } = api
      const { amount, amountError } = get()[sliceKey].formValues

      if (!signerAddress || +amount <= 0 || amountError) return

      get()[sliceKey].setStateByKey('formEstGas', { [activeKey]: { ...DEFAULT_FORM_EST_GAS, loading: true } })
      await get().gas.fetchGasInfo(api)
      const fn = _isDeposit(formType) ? apiLending.vaultDeposit.estGasApproval : apiLending.vaultMint.estGasApproval
      const resp = await fn(activeKey, market, amount)
      get()[sliceKey].setStateByKey('formEstGas', { [resp.activeKey]: { estimatedGas: resp.estimatedGas } })

      // update formStatus
      const cFormStatus = cloneDeep(get()[sliceKey].formStatus)
      cFormStatus.isApproved = resp.isApproved
      cFormStatus.error = cFormStatus.error || resp.error
      get()[sliceKey].setStateByKey('formStatus', cFormStatus)
    },
    fetchDetails: async (activeKey, formType: FormType, market) => {
      const { amount } = get()[sliceKey].formValues

      if (+amount <= 0) return

      const resp = _isDeposit(formType)
        ? await apiLending.vaultDeposit.detailInfo(activeKey, market, amount)
        : await apiLending.vaultMint.detailInfo(activeKey, market, amount)
      get()[sliceKey].setStateByActiveKey('detailInfo', activeKey, resp)
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
        cFormValues.amountError = helpers.isTooMuch(cFormValues.amount, userBalancesResp?.borrowed)
          ? 'too-much-wallet'
          : ''
        get()[sliceKey].setStateByKeys({ activeKey, formValues: cFormValues })
      }

      // api calls
      get()[sliceKey].fetchDetails(activeKey, formType, market)

      if (signerAddress) {
        await get()[sliceKey].fetchMax(rChainId, formType, market)
        get()[sliceKey].fetchEstGasApproval(activeKey, formType, api, market)
      }
    },

    // steps
    fetchStepApprove: async (activeKey, formType, api, market, formValues) => {
      const provider = get().wallet.getProvider(sliceKey)

      if (!provider) return

      // update formStatus
      const partialFormStatus: Partial<FormStatus> = { isInProgress: true, step: 'APPROVAL' }
      get()[sliceKey].setStateByKey('formStatus', merge(cloneDeep(get()[sliceKey].formStatus), partialFormStatus))

      await get().gas.fetchGasInfo(api)
      const fn = _isDeposit(formType) ? apiLending.vaultDeposit.approve : apiLending.vaultMint.approve
      const { amount } = formValues
      const resp = await fn(activeKey, provider, market, amount)

      if (resp.activeKey === get()[sliceKey].activeKey) {
        // update formStatus
        const partialFormStatus: Partial<FormStatus> = {
          error: resp.error,
          isApproved: !resp.error,
          isInProgress: true,
        }
        get()[sliceKey].setStateByKey('formStatus', merge(cloneDeep(FORM_STATUS), partialFormStatus))
        if (!resp.error) get()[sliceKey].fetchEstGasApproval(activeKey, formType, api, market)
        return resp
      }
    },
    fetchStepDepositMint: async (activeKey, formType, api, market, formValues) => {
      const provider = get().wallet.getProvider(sliceKey)

      if (!provider) return

      // update formStatus
      const partialFormStatus: Partial<FormStatus> = { isInProgress: true, step: 'DEPOSIT_MINT' }
      get()[sliceKey].setStateByKey('formStatus', merge(cloneDeep(get()[sliceKey].formStatus), partialFormStatus))

      // api calls
      await get().gas.fetchGasInfo(api)
      const fn = _isDeposit(formType) ? apiLending.vaultDeposit.deposit : apiLending.vaultMint.mint
      const { amount } = formValues
      const resp = await fn(activeKey, provider, market, amount)

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

export function _isDeposit(formType: FormType) {
  return formType === 'deposit'
}

export function _getActiveKey(
  rChainId: ChainId,
  formType: FormType | null,
  market: OneWayMarketTemplate | undefined,
  { amount }: FormValues,
) {
  return `${rChainId}-${formType}-${market?.id ?? ''}-${amount}`
}

export function _getMaxActiveKey(rChainId: ChainId, formType: string | null, market: OneWayMarketTemplate | undefined) {
  return `${rChainId}-${formType}-${market?.id ?? ''}`
}

export default createVaultMint
