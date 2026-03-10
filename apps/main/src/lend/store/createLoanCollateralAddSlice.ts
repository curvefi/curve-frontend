import lodash from 'lodash'
import { StoreApi } from 'zustand'
import type { FormStatus, FormValues } from '@/lend/components/PageLendMarket/LoanCollateralAdd/types'
import type { FormDetailInfo, FormEstGas } from '@/lend/components/PageLendMarket/types'
import { DEFAULT_FORM_EST_GAS, DEFAULT_FORM_STATUS as FORM_STATUS } from '@/lend/components/PageLendMarket/utils'
import { refetchUserMarket } from '@/lend/entities/invalidate'
import { helpers, apiLending } from '@/lend/lib/apiLending'
import { networks } from '@/lend/networks'
import type { State } from '@/lend/store/useStore'
import { Api, OneWayMarketTemplate } from '@/lend/types/lend.types'
import { _parseActiveKey } from '@/lend/utils/helpers'
import { updateUserEventsApi } from '@/llamalend/llama.utils'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { setMissingProvider } from '@ui-kit/utils/store.util'

type StateKey = keyof typeof DEFAULT_STATE
const { cloneDeep } = lodash

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

export const createLoanCollateralAdd = (
  _: StoreApi<State>['setState'],
  get: StoreApi<State>['getState'],
): LoanCollateralAddSlice => ({
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
      const { formStatus, formValues, ...sliceState } = get()[sliceKey]
      const { signerAddress } = api
      const { collateral, collateralError } = formValues

      if (!signerAddress || +collateral <= 0 || collateralError) return

      sliceState.setStateByKey('formEstGas', { [activeKey]: { ...DEFAULT_FORM_EST_GAS, loading: true } })
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
      void sliceState.fetchDetailInfo(activeKey, api, market)
      void sliceState.fetchEstGasApproval(activeKey, api, market)
    },

    // step
    fetchStepApprove: async (activeKey, api, market, formValues) => {
      const sliceState = get()[sliceKey]
      const { provider } = useWallet.getState()

      if (!provider) return setMissingProvider(get()[sliceKey])

      // loading state
      sliceState.setStateByKey('formStatus', { ...DEFAULT_FORM_STATUS, isInProgress: true, step: 'APPROVAL' })

      // api calls
      const { error, ...resp } = await loanCollateralAdd.approve(activeKey, provider, market, formValues.collateral)

      if (resp.activeKey === get()[sliceKey].activeKey) {
        // update formStatus
        sliceState.setStateByKey('formStatus', {
          ...DEFAULT_FORM_STATUS,
          stepError: error,
          isApproved: !error,
          isInProgress: !error,
        })
        if (!error) void sliceState.fetchEstGasApproval(activeKey, api, market)
        return { ...resp, error }
      }
    },
    fetchStepIncrease: async (activeKey, api, market, formValues) => {
      const { markets, user } = get()
      const sliceState = get()[sliceKey]
      const { provider, wallet } = useWallet.getState()
      const { chainId } = api

      if (!provider || !wallet) return setMissingProvider(sliceState)

      // loading
      sliceState.setStateByKey('formStatus', {
        ...DEFAULT_FORM_STATUS,
        isApproved: true,
        isInProgress: true,
        step: 'ADD',
      })

      const { error, ...resp } = await loanCollateralAdd.addCollateral(
        activeKey,
        provider,
        market,
        formValues.collateral,
      )

      updateUserEventsApi(wallet, networks[chainId], market, resp.hash)

      if (resp.activeKey === get()[sliceKey].activeKey) {
        if (error) {
          sliceState.setStateByKey('formStatus', { ...DEFAULT_FORM_STATUS, stepError: error, isApproved: true })
          return { ...resp, error, loanExists: true }
        } else {
          const { loanExists } = await refetchUserMarket({ api, market, state: { user, markets } })

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
    setStateByKeys: (sliceState: Partial<SliceState>) => {
      get().setAppStateByKeys(sliceKey, sliceState)
    },
    resetState: () => {
      get().resetAppState(sliceKey, cloneDeep(DEFAULT_STATE))
    },
  },
})

export function _getActiveKey(api: Api | null, market: OneWayMarketTemplate | undefined, collateral: string) {
  return `${_parseActiveKey(api, market)}-${collateral}`
}
