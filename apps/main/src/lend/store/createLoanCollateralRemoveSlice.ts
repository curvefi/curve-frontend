import lodash from 'lodash'
import { StoreApi } from 'zustand'
import type { FormStatus, FormValues } from '@/lend/components/PageLendMarket/LoanCollateralRemove/types'
import type { FormDetailInfo, FormEstGas } from '@/lend/components/PageLendMarket/types'
import { DEFAULT_FORM_EST_GAS, DEFAULT_FORM_STATUS as FORM_STATUS } from '@/lend/components/PageLendMarket/utils'
import { invalidateMarketDetails } from '@/lend/entities/market-details'
import { invalidateAllUserBorrowDetails } from '@/lend/entities/user-loan-details'
import apiLending, { helpers } from '@/lend/lib/apiLending'
import networks from '@/lend/networks'
import type { State } from '@/lend/store/useStore'
import { Api, OneWayMarketTemplate } from '@/lend/types/lend.types'
import { _parseActiveKey } from '@/lend/utils/helpers'
import { updateUserEventsApi } from '@/llamalend/llama.utils'
import { refetchLoanExists } from '@/llamalend/queries/loan-exists'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { setMissingProvider } from '@ui-kit/utils/store.util'

const { cloneDeep } = lodash

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  activeKey: string
  detailInfo: { [activeKey: string]: FormDetailInfo }
  formEstGas: { [activeKey: string]: FormEstGas }
  formStatus: FormStatus
  formValues: FormValues
  maxRemovable: string
}

const sliceKey = 'loanCollateralRemove'

// prettier-ignore
export type LoanCollateralRemoveSlice = {
  [sliceKey]: SliceState & {
    fetchMaxRemovable(api: Api, market: OneWayMarketTemplate): Promise<void>
    fetchDetailInfo(activeKey: string, api: Api, market: OneWayMarketTemplate): Promise<void>
    fetchEstGas(activeKey: string, api: Api, market: OneWayMarketTemplate): Promise<void>
    setFormValues(api: Api | null, market: OneWayMarketTemplate | undefined, partialFormValues: Partial<FormValues>, shouldRefetch?: boolean): Promise<void>

    // step
    fetchStepDecrease(activeKey: string, api: Api, market: OneWayMarketTemplate, formValues: FormValues): Promise<{ activeKey: string; error: string; hash: string } | undefined>

    // steps helper
    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

export const DEFAULT_FORM_VALUES: FormValues = {
  collateral: '',
  collateralError: '',
}

export const DEFAULT_FORM_STATUS: FormStatus = {
  ...FORM_STATUS,
  step: '',
}

const DEFAULT_STATE: SliceState = {
  activeKey: '',
  detailInfo: {},
  formEstGas: {},
  formStatus: DEFAULT_FORM_STATUS,
  formValues: DEFAULT_FORM_VALUES,
  maxRemovable: '',
}

const { loanCollateralRemove } = apiLending
const { isTooMuch } = helpers

const createLoanCollateralRemove = (
  _: StoreApi<State>['setState'],
  get: StoreApi<State>['getState'],
): LoanCollateralRemoveSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchMaxRemovable: async (api, market) => {
      const { formStatus, formValues, ...sliceState } = get()[sliceKey]
      const { signerAddress } = api

      if (!signerAddress) return

      const resp = await loanCollateralRemove.maxRemovable(market)
      if (resp.error) sliceState.setStateByKey('formStatus', { ...formStatus, error: resp.error })
      sliceState.setStateByKey('maxRemovable', resp.maxRemovable)

      // validation
      const collateralError = isTooMuch(formValues.collateral, resp.maxRemovable) ? 'too-much-max' : ''
      sliceState.setStateByKey('formValues', { ...formValues, collateralError })
    },
    fetchDetailInfo: async (activeKey, api, market) => {
      const { formValues, ...sliceState } = get()[sliceKey]
      const { signerAddress } = api
      const { collateral, collateralError } = formValues

      if (!signerAddress || +collateral <= 0 || collateralError) return

      const resp = await loanCollateralRemove.detailInfo(activeKey, api, market, collateral)
      sliceState.setStateByActiveKey('detailInfo', resp.activeKey, resp.resp)
    },
    fetchEstGas: async (activeKey, api, market) => {
      const { formStatus, formValues, ...sliceState } = get()[sliceKey]
      const { signerAddress } = api
      const { collateral, collateralError } = formValues

      if (!signerAddress || +collateral <= 0 || collateralError) return

      sliceState.setStateByKey('formEstGas', { [activeKey]: { ...DEFAULT_FORM_EST_GAS, loading: true } })
      const resp = await loanCollateralRemove.estGas(activeKey, market, collateral)
      sliceState.setStateByKey('formEstGas', { [resp.activeKey]: { estimatedGas: resp.estimatedGas, loading: false } })

      // update formStatus
      sliceState.setStateByKey('formStatus', { ...formStatus, error: formStatus.error || resp.error })
    },
    setFormValues: async (api, market, partialFormValues, shouldRefetch) => {
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
        const userBalances = await user.fetchUserMarketBalances(api, market, shouldRefetch)
        const collateralError = isTooMuch(cFormValues.collateral, userBalances?.collateral) ? 'too-much' : ''
        sliceState.setStateByKey('formValues', { ...cFormValues, collateralError })
      }

      // api calls
      await sliceState.fetchMaxRemovable(api, market)
      void sliceState.fetchDetailInfo(activeKey, api, market)
      void sliceState.fetchEstGas(activeKey, api, market)
    },

    // steps
    fetchStepDecrease: async (activeKey, api, market) => {
      const { markets, user } = get()
      const { formStatus, formValues, ...sliceState } = get()[sliceKey]
      const { provider, wallet } = useWallet.getState()
      const { chainId } = api

      if (!provider || !wallet) return setMissingProvider(get()[sliceKey])

      // update formStatus
      sliceState.setStateByKey('formStatus', {
        ...DEFAULT_FORM_STATUS,
        isApproved: formStatus.isApproved,
        isInProgress: true,
        step: 'REMOVE',
      })

      const { error, ...resp } = await loanCollateralRemove.removeCollateral(
        activeKey,
        provider,
        market,
        formValues.collateral,
      )
      updateUserEventsApi(wallet, networks[chainId], market, resp.hash)

      if (resp.activeKey === get()[sliceKey].activeKey) {
        if (error) {
          sliceState.setStateByKey('formStatus', { ...DEFAULT_FORM_STATUS, stepError: error })
          return { ...resp, error }
        } else {
          // api calls
          const loanExists = await refetchLoanExists({
            chainId,
            marketId: market.id,
            userAddress: wallet?.account?.address,
          })
          if (loanExists) {
            void user.fetchAll(api, market, true)
            invalidateAllUserBorrowDetails({ chainId: api.chainId, marketId: market.id })
          }
          invalidateMarketDetails({ chainId: api.chainId, marketId: market.id })
          void markets.fetchAll(api, market, true)

          // update formStatus
          sliceState.setStateByKeys({
            ...DEFAULT_STATE,
            formStatus: { ...DEFAULT_FORM_STATUS, isComplete: true },
          })
          void sliceState.setFormValues(api, market, DEFAULT_FORM_VALUES)
          return { ...resp, error }
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

export default createLoanCollateralRemove

export function _getActiveKey(api: Api | null, market: OneWayMarketTemplate | undefined, collateral: string) {
  return `${_parseActiveKey(api, market)}-${collateral}`
}
