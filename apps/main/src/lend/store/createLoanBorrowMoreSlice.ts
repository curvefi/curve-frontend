import lodash from 'lodash'
import { StoreApi } from 'zustand'
import type {
  FormDetailInfoLeverage,
  FormStatus,
  FormValues,
} from '@/lend/components/PageLendMarket/LoanBorrowMore/types'
import {
  _parseValues,
  DEFAULT_FORM_STATUS,
  DEFAULT_FORM_VALUES,
} from '@/lend/components/PageLendMarket/LoanBorrowMore/utils'
import type { FormDetailInfo, FormEstGas } from '@/lend/components/PageLendMarket/types'
import { DEFAULT_FORM_EST_GAS } from '@/lend/components/PageLendMarket/utils'
import { refetchUserMarket } from '@/lend/entities/invalidate'
import { helpers, apiLending } from '@/lend/lib/apiLending'
import { networks } from '@/lend/networks'
import type { State } from '@/lend/store/useStore'
import { Api, ChainId, OneWayMarketTemplate } from '@/lend/types/lend.types'
import { _parseActiveKey } from '@/lend/utils/helpers'
import { updateUserEventsApi } from '@/llamalend/llama.utils'
import { getLib, useWallet } from '@ui-kit/features/connect-wallet'
import { setMissingProvider } from '@ui-kit/utils/store.util'

type StateKey = keyof typeof DEFAULT_STATE
const { cloneDeep } = lodash

type SliceState = {
  activeKey: string
  activeKeyMax: string
  detailInfo: { [activeKey: string]: FormDetailInfo }
  detailInfoLeverage: { [activeKey: string]: FormDetailInfoLeverage }
  formEstGas: { [activeKey: string]: FormEstGas }
  formStatus: FormStatus
  formValues: FormValues
  maxRecv: { [activeKeyMax: string]: string }
}

const sliceKey = 'loanBorrowMore'

// prettier-ignore
export type LoanBorrowMoreSlice = {
  [sliceKey]: SliceState & {
    fetchMaxRecv(activeKeyMax: string, api: Api, market: OneWayMarketTemplate, isLeverage: boolean): Promise<void>
    refetchMaxRecv(market: OneWayMarketTemplate | undefined, isLeverage: boolean): Promise<string>
    fetchDetailInfo(activeKey: string, api: Api, market: OneWayMarketTemplate, maxSlippage: string, isLeverage: boolean): Promise<void>
    fetchEstGasApproval(activeKey: string, api: Api, market: OneWayMarketTemplate, maxSlippage: string, isLeverage: boolean): Promise<void>
    setFormValues(api: Api | null, market: OneWayMarketTemplate | undefined, partialFormValues: Partial<FormValues>, maxSlippage: string, isLeverage: boolean, shouldRefetch?: boolean): Promise<void>

    // steps
    fetchStepApprove(activeKey: string, api: Api, market: OneWayMarketTemplate, formValues: FormValues, maxSlippage: string, isLeverage: boolean): Promise<{ hashes: string[]; error: string } | undefined>
    fetchStepIncrease(activeKey: string, api: Api, market: OneWayMarketTemplate, formValues: FormValues, maxSlippage: string, isLeverage: boolean): Promise<{ activeKey: string; error: string; hash: string } | undefined>

    // steps helper
    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(rChainId?: ChainId, rOwmId?: string, isLeverage?: boolean): void
  }
}

const DEFAULT_STATE: SliceState = {
  activeKey: '',
  activeKeyMax: '',
  detailInfo: {},
  detailInfoLeverage: {},
  formEstGas: {},
  formStatus: DEFAULT_FORM_STATUS,
  formValues: DEFAULT_FORM_VALUES,
  maxRecv: {},
}

const { loanBorrowMore } = apiLending
const { isTooMuch } = helpers

export const createLoanBorrowMore = (
  _: StoreApi<State>['setState'],
  get: StoreApi<State>['getState'],
): LoanBorrowMoreSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchMaxRecv: async (activeKeyMax, api, market, isLeverage) => {
      const { maxRecv, formValues, ...sliceState } = get()[sliceKey]
      const { signerAddress } = api
      const { userCollateral, userBorrowed } = formValues

      let updatedMaxRecv = maxRecv[activeKeyMax]

      if (!signerAddress) return

      if (typeof updatedMaxRecv === 'undefined') {
        if (isLeverage) {
          const resp = await loanBorrowMore.maxRecvLeverage(market, activeKeyMax, userCollateral, userBorrowed)
          updatedMaxRecv = resp.maxRecv?.maxDebt ?? ''
          sliceState.setStateByActiveKey('maxRecv', resp.activeKey, updatedMaxRecv)
        } else {
          const resp = await loanBorrowMore.maxRecv(market, activeKeyMax, userCollateral)
          updatedMaxRecv = resp.maxRecv
          sliceState.setStateByActiveKey('maxRecv', resp.activeKey, updatedMaxRecv)
        }
      }

      // validation
      const debtError = isTooMuch(formValues.debt, updatedMaxRecv) ? 'too-much' : formValues.debtError
      sliceState.setStateByKey('formValues', { ...formValues, debtError })
    },
    refetchMaxRecv: async (market, isLeverage) => {
      const api = getLib('llamaApi')
      const { activeKeyMax, formValues, ...sliceState } = get()[sliceKey]
      const { userCollateral, userBorrowed } = formValues

      if (!market || !api) return ''

      const { signerAddress } = api

      if (!signerAddress) return ''

      // loading
      sliceState.setStateByActiveKey('maxRecv', activeKeyMax, '')

      if (isLeverage) {
        const resp = await loanBorrowMore.maxRecvLeverage(market, activeKeyMax, userCollateral, userBorrowed)
        const maxDebt = resp.maxRecv?.maxDebt ?? ''
        sliceState.setStateByActiveKey('maxRecv', resp.activeKey, maxDebt)
        return maxDebt
      } else {
        const resp = await loanBorrowMore.maxRecv(market, activeKeyMax, userCollateral)
        sliceState.setStateByActiveKey('maxRecv', resp.activeKey, resp.maxRecv)
        return resp.maxRecv
      }
    },
    fetchDetailInfo: async (activeKey, api, market, maxSlippage, isLeverage) => {
      const { detailInfo, detailInfoLeverage, formValues, ...sliceState } = get()[sliceKey]
      const { signerAddress } = api
      const { userCollateral, userBorrowed, debt } = formValues
      const { haveDebt } = _parseValues(formValues)
      const storedDetailInfo = isLeverage ? detailInfoLeverage[activeKey] : detailInfo[activeKey]

      if (!signerAddress || !haveDebt) return

      // loading
      sliceState.setStateByActiveKey(isLeverage ? 'detailInfoLeverage' : 'detailInfo', activeKey, {
        ...(storedDetailInfo ?? {}),
        loading: true,
      })

      if (isLeverage) {
        const resp = await loanBorrowMore.detailInfoLeverage(
          activeKey,
          api,
          market,
          userCollateral,
          userBorrowed,
          debt,
          maxSlippage,
        )
        sliceState.setStateByActiveKey('detailInfoLeverage', resp.activeKey, { ...resp.resp, error: resp.error })
      } else {
        const resp = await loanBorrowMore.detailInfo(activeKey, api, market, userCollateral, debt)
        sliceState.setStateByActiveKey('detailInfo', resp.activeKey, { ...resp.resp, error: resp.error })
      }
    },
    fetchEstGasApproval: async (activeKey, api, market, maxSlippage, isLeverage) => {
      const { formStatus, formValues, ...sliceState } = get()[sliceKey]
      const { signerAddress } = api
      const { userCollateral, userBorrowed, debt } = formValues
      const { haveDebt } = _parseValues(formValues)

      if (!signerAddress || !haveDebt) return

      sliceState.setStateByKey('formEstGas', { [activeKey]: { ...DEFAULT_FORM_EST_GAS, loading: true } })
      const resp = await loanBorrowMore.estGasApproval(
        activeKey,
        market,
        userCollateral,
        userBorrowed,
        debt,
        maxSlippage,
        isLeverage,
      )
      sliceState.setStateByKey('formEstGas', { [resp.activeKey]: { estimatedGas: resp.estimatedGas } })

      // update formStatus
      sliceState.setStateByKey('formStatus', {
        ...formStatus,
        loading: false,
        isApproved: resp.isApproved,
        error: formStatus.error || resp.error,
      })
    },
    setFormValues: async (api, market, partialFormValues, maxSlippage, isLeverage, shouldRefetch) => {
      const { user } = get()
      const { formStatus, formValues, maxRecv, ...sliceState } = get()[sliceKey]

      // update activeKey, formValues
      const cFormValues: FormValues = {
        ...formValues,
        ...partialFormValues,
        userCollateralError: '',
        userBorrowedError: '',
        debtError: '',
      }
      const cFormStatus: FormStatus = {
        ...DEFAULT_FORM_STATUS,
        isApproved: formStatus.isApproved,
        isApprovedCompleted: formStatus.isApprovedCompleted,
      }
      const activeKey = _getActiveKeys(api, market, cFormValues, isLeverage, maxSlippage)
      sliceState.setStateByKeys({ ...activeKey, formValues: cFormValues, formStatus: cFormStatus })

      if (!api || !market) return

      const { signerAddress } = api

      // validation - if in soft-liquidation mode, user cannot add more collateral
      if (signerAddress && +cFormValues.userCollateral > 0) {
        const userActiveKey = helpers.getUserActiveKey(api, market)
        const state = await user.loansDetailsMapper[userActiveKey]?.details?.state

        if (!state) return

        const isInSoftLiquidationMode = +state.borrowed > 0
        if (isInSoftLiquidationMode) {
          sliceState.setStateByKey('formStatus', { ...cFormStatus, error: 'error-liquidation-mode' })
        }
      }

      // validation
      if (signerAddress) {
        const userBalances = await user.fetchUserMarketBalances(api, market, shouldRefetch)
        const userCollateralError = isTooMuch(cFormValues.userCollateral, userBalances?.collateral) ? 'too-much' : ''
        const userBorrowedError = isTooMuch(cFormValues.userBorrowed, userBalances?.borrowed) ? 'too-much' : ''
        sliceState.setStateByKey('formValues', { ...cFormValues, userCollateralError, userBorrowedError })
      }

      // api calls
      await sliceState.fetchMaxRecv(activeKey.activeKeyMax, api, market, isLeverage)
      await sliceState.fetchDetailInfo(activeKey.activeKey, api, market, maxSlippage, isLeverage)
      void sliceState.fetchEstGasApproval(activeKey.activeKey, api, market, maxSlippage, isLeverage)
    },

    // steps
    fetchStepApprove: async (activeKey, api, market, formValues, maxSlippage, isLeverage) => {
      const sliceState = get()[sliceKey]
      const { provider } = useWallet.getState()
      if (!provider) return setMissingProvider(get()[sliceKey])

      // update formStatus
      sliceState.setStateByKey('formStatus', { ...DEFAULT_FORM_STATUS, isInProgress: true, step: 'APPROVAL' })

      // api calls
      const { userCollateral, userBorrowed } = formValues
      const { error, ...resp } = await loanBorrowMore.approve(
        activeKey,
        provider,
        market,
        userCollateral,
        userBorrowed,
        isLeverage,
      )

      if (resp.activeKey === get()[sliceKey].activeKey) {
        // update formStatus
        sliceState.setStateByKey('formStatus', {
          ...DEFAULT_FORM_STATUS,
          isApproved: !error,
          isApprovedCompleted: !error,
          stepError: error,
        })
        if (!error) void sliceState.fetchEstGasApproval(activeKey, api, market, maxSlippage, isLeverage)
        return { ...resp, error }
      }
    },
    fetchStepIncrease: async (activeKey, api, market, formValues, maxSlippage, isLeverage) => {
      const { markets, user } = get()
      const { formStatus, ...sliceState } = get()[sliceKey]
      const { provider, wallet } = useWallet.getState()
      const { chainId } = api

      if (!provider || !wallet) return setMissingProvider(get()[sliceKey])

      // loading
      sliceState.setStateByKey('formStatus', {
        ...DEFAULT_FORM_STATUS,
        isApproved: true,
        isApprovedCompleted: formStatus.isApprovedCompleted,
        isInProgress: true,
        step: 'BORROW_MORE',
      })

      // api call
      const { userCollateral, userBorrowed, debt } = formValues
      const { error, ...resp } = await loanBorrowMore.borrowMore(
        activeKey,
        provider,
        market,
        userCollateral,
        userBorrowed,
        debt,
        maxSlippage,
        isLeverage,
      )

      updateUserEventsApi(wallet, networks[chainId], market, resp.hash)

      if (resp.activeKey === get()[sliceKey].activeKey) {
        if (error) {
          sliceState.setStateByKey('formStatus', {
            ...formStatus,
            isInProgress: false,
            step: '',
            stepError: error,
          })
          return { ...resp, error }
        } else {
          await refetchUserMarket({ api, market, state: { user, markets } })

          // update formStatus
          sliceState.setStateByKeys({
            ...DEFAULT_STATE,
            formStatus: { ...DEFAULT_FORM_STATUS, isApproved: true, isComplete: true },
          })
          void sliceState.setFormValues(api, market, DEFAULT_FORM_VALUES, maxSlippage, isLeverage)
          return { ...resp, error }
        }
      }
    },

    // slice helpers
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

export function _getActiveKeys(
  api: Api | null,
  market: OneWayMarketTemplate | undefined,
  { userCollateral, userBorrowed, debt }: FormValues,
  isLeverage: boolean,
  maxSlippage: string,
) {
  const leverageKey = isLeverage ? 'leverage' : ''
  const activeKey = `${_parseActiveKey(api, market)}${leverageKey}`

  return {
    activeKey: `${activeKey}-${userCollateral}-${userBorrowed}-${debt}-${maxSlippage}`,
    activeKeyMax: `${activeKey}-${userCollateral}`,
  }
}
