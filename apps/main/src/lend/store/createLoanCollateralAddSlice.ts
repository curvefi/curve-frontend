import type { GetState, SetState } from 'zustand'
import type { State } from '@lend/store/useStore'
import type { FormDetailInfo, FormEstGas } from '@lend/components/PageLoanManage/types'
import type { FormStatus, FormValues } from '@lend/components/PageLoanManage/LoanCollateralAdd/types'

import cloneDeep from 'lodash/cloneDeep'

import { DEFAULT_FORM_EST_GAS, DEFAULT_FORM_STATUS as FORM_STATUS } from '@lend/components/PageLoanManage/utils'
import { _parseActiveKey } from '@lend/utils/helpers'
import apiLending, { helpers } from '@lend/lib/apiLending'
import { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'
import { Api } from '@lend/types/lend.types'
import { useWalletStore } from '@ui-kit/features/connect-wallet'
import { setMissingProvider } from '@ui-kit/features/connect-wallet'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  activeKey: string
  detailInfo: { [activeKey: string]: FormDetailInfo }
  formEstGas: { [activeKey: string]: FormEstGas }
  formStatus: FormStatus
  formValues: FormValues
}

const sliceKey = 'loanCollateralAdd'

// prettier-ignore
export type LoanCollateralAddSlice = {
  [sliceKey]: SliceState & {
    fetchDetailInfo(activeKey: string, api: Api, market: OneWayMarketTemplate): Promise<void>
    fetchEstGasApproval(activeKey: string, api: Api, market: OneWayMarketTemplate): Promise<void>
    setFormValues(api: Api | null, market: OneWayMarketTemplate | undefined, formValues: Partial<FormValues>): Promise<void>

    // steps
    fetchStepApprove(activeKey: string, api: Api, market: OneWayMarketTemplate, formValues: FormValues): Promise<{ hashes: string[]; activeKey: string; error: string } | undefined>
    fetchStepIncrease(activeKey: string, api: Api, market: OneWayMarketTemplate, formValues: FormValues): Promise<{ activeKey: string; error: string; hash: string; loanExists: boolean } | undefined>

    // steps helper
    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

export const DEFAULT_FORM_STATUS: FormStatus = {
  ...FORM_STATUS,
  step: '',
}

export const DEFAULT_FORM_VALUES: FormValues = {
  collateral: '',
  collateralError: '',
}

const DEFAULT_STATE: SliceState = {
  activeKey: '',
  detailInfo: {},
  formEstGas: {},
  formStatus: DEFAULT_FORM_STATUS,
  formValues: DEFAULT_FORM_VALUES,
}

const { loanCollateralAdd } = apiLending
const { isTooMuch } = helpers

const createLoanCollateralAdd = (_: SetState<State>, get: GetState<State>): LoanCollateralAddSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchDetailInfo: async (activeKey, api, market) => {
      const { formValues, ...sliceState } = get()[sliceKey]
      const { signerAddress } = api
      const { collateral } = formValues

      if (!signerAddress || +collateral <= 0) return

      const resp = await loanCollateralAdd.detailInfo(activeKey, api, market, collateral)
      sliceState.setStateByActiveKey('detailInfo', resp.activeKey, resp.resp)
    },
    fetchEstGasApproval: async (activeKey, api, market) => {
      const { gas } = get()
      const { formStatus, formValues, ...sliceState } = get()[sliceKey]
      const { signerAddress } = api
      const { collateral, collateralError } = formValues

      if (!signerAddress || +collateral <= 0 || collateralError) return

      sliceState.setStateByKey('formEstGas', { [activeKey]: { ...DEFAULT_FORM_EST_GAS, loading: true } })
      await gas.fetchGasInfo(api)
      const resp = await loanCollateralAdd.estGasApproval(activeKey, market, collateral)
      sliceState.setStateByKey('formEstGas', { [resp.activeKey]: { estimatedGas: resp.estimatedGas, loading: false } })

      // update formStatus
      sliceState.setStateByKey('formStatus', {
        ...formStatus,
        isApproved: resp.isApproved,
        error: formStatus.error || resp.error,
      })
    },
    setFormValues: async (api, market, partialFormValues) => {
      const { user } = get()
      const { formStatus, formValues, ...sliceState } = get()[sliceKey]

      // update activeKey, formValues
      const cFormValues: FormValues = { ...formValues, ...partialFormValues, collateralError: '' }
      const cFormStatus: FormStatus = { ...DEFAULT_FORM_STATUS, isApproved: formStatus.isApproved }
      const activeKey = _getActiveKey(api, market, cFormValues.collateral)
      sliceState.setStateByKeys({ activeKey, formValues: cFormValues, formStatus: cFormStatus })

      if (!api || !market) return

      const { signerAddress } = api

      // validation
      if (signerAddress) {
        const userBalancesResp = await user.fetchUserMarketBalances(api, market, true)
        const collateralError = isTooMuch(cFormValues.collateral, userBalancesResp.collateral) ? 'too-much' : ''
        sliceState.setStateByKey('formValues', { ...cFormValues, collateralError })
      }

      // api calls
      sliceState.fetchDetailInfo(activeKey, api, market)
      sliceState.fetchEstGasApproval(activeKey, api, market)
    },

    // step
    fetchStepApprove: async (activeKey, api, market, formValues) => {
      const { gas } = get()
      const sliceState = get()[sliceKey]
      const { provider } = useWalletStore.getState()

      if (!provider) return setMissingProvider(get()[sliceKey])

      // loading state
      sliceState.setStateByKey('formStatus', { ...DEFAULT_FORM_STATUS, isInProgress: true, step: 'APPROVAL' })

      // api calls
      await gas.fetchGasInfo(api)
      const { error, ...resp } = await loanCollateralAdd.approve(activeKey, provider, market, formValues.collateral)

      if (resp.activeKey === get()[sliceKey].activeKey) {
        // update formStatus
        sliceState.setStateByKey('formStatus', {
          ...DEFAULT_FORM_STATUS,
          stepError: error,
          isApproved: !error,
          isInProgress: !error,
        })
        if (!error) sliceState.fetchEstGasApproval(activeKey, api, market)
        return { ...resp, error }
      }
    },
    fetchStepIncrease: async (activeKey, api, market, formValues) => {
      const { gas, markets, user } = get()
      const sliceState = get()[sliceKey]
      const { provider } = useWalletStore.getState()

      if (!provider) return setMissingProvider(sliceState)

      // loading
      sliceState.setStateByKey('formStatus', {
        ...DEFAULT_FORM_STATUS,
        isApproved: true,
        isInProgress: true,
        step: 'ADD',
      })

      await gas.fetchGasInfo(api)
      const { error, ...resp } = await loanCollateralAdd.addCollateral(
        activeKey,
        provider,
        market,
        formValues.collateral,
      )

      if (resp.activeKey === get()[sliceKey].activeKey) {
        if (error) {
          sliceState.setStateByKey('formStatus', { ...DEFAULT_FORM_STATUS, stepError: error, isApproved: true })
          return { ...resp, error, loanExists: true }
        } else {
          // api calls
          const loanExists = (await user.fetchUserLoanExists(api, market, true))?.loanExists
          if (loanExists) user.fetchAll(api, market, true)
          markets.fetchAll(api, market, true)

          // update formStatus
          sliceState.setStateByKeys({
            ...DEFAULT_STATE,
            formStatus: { ...DEFAULT_FORM_STATUS, isApproved: true, isComplete: true },
          })

          return { ...resp, error, loanExists }
        }
      }
    },

    // helpers
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

export default createLoanCollateralAdd

export function _getActiveKey(api: Api | null, market: OneWayMarketTemplate | undefined, collateral: string) {
  return `${_parseActiveKey(api, market)}-${collateral}`
}
