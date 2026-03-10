import lodash from 'lodash'
import type { StoreApi } from 'zustand'
import type { FormDetailInfoLeverage, FormStatus, FormValues } from '@/lend/components/PageLendMarket/LoanRepay/types'
import {
  _parseValues,
  DEFAULT_FORM_STATUS,
  DEFAULT_FORM_VALUES,
} from '@/lend/components/PageLendMarket/LoanRepay/utils'
import type { FormDetailInfo, FormEstGas } from '@/lend/components/PageLendMarket/types'
import { DEFAULT_FORM_EST_GAS } from '@/lend/components/PageLendMarket/utils'
import { refetchUserMarket } from '@/lend/entities/invalidate'
import { apiLending, helpers } from '@/lend/lib/apiLending'
import { networks } from '@/lend/networks'
import type { State } from '@/lend/store/useStore'
import { Api, FormError, OneWayMarketTemplate, UserLoanState } from '@/lend/types/lend.types'
import { _parseActiveKey } from '@/lend/utils/helpers'
import { updateUserEventsApi } from '@/llamalend/llama.utils'
import { refetchLoanExists } from '@/llamalend/queries/user'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { setMissingProvider } from '@ui-kit/utils/store.util'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  activeKey: string
  repayIsAvailable: { [userActiveKey: string]: boolean | null }
  detailInfo: { [activeKey: string]: FormDetailInfo }
  detailInfoLeverage: { [activeKey: string]: FormDetailInfoLeverage }
  formEstGas: { [activeKey: string]: FormEstGas }
  formStatus: FormStatus
  formValues: FormValues
}

const sliceKey = 'loanRepay'

// prettier-ignore
export type LoanRepaySlice = {
  [sliceKey]: SliceState & {
    fetchDetailInfo(activeKey: string, api: Api, market: OneWayMarketTemplate, maxSlippage: string, userState: UserLoanState): Promise<void>
    fetchEstGasApproval(activeKey: string, api: Api, market: OneWayMarketTemplate, maxSlippage: string): Promise<void>
    setFormValues(api: Api | null, market: OneWayMarketTemplate | undefined, partialFormValues: Partial<FormValues>, maxSlippage: string, shouldRefetch?: boolean): Promise<void>

    // step
    fetchStepApprove(activeKey: string, api: Api, market: OneWayMarketTemplate, formValues: FormValues, maxSlippage: string): Promise<{ hashes: string[]; activeKey: string; error: string } | undefined>
    fetchStepRepay(activeKey: string, api: Api, market: OneWayMarketTemplate, formValues: FormValues, maxSlippage: string): Promise<{ activeKey: string; error: string; hash: string; loanExists: boolean } | undefined>

    // steps helper
    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  activeKey: '',
  repayIsAvailable: {},
  detailInfo: {},
  detailInfoLeverage: {},
  formEstGas: {},
  formStatus: DEFAULT_FORM_STATUS,
  formValues: DEFAULT_FORM_VALUES,
}

const { getUserActiveKey, isTooMuch } = helpers
const { loanRepay } = apiLending

export const createLoanRepaySlice = (
  _set: StoreApi<State>['setState'],
  get: StoreApi<State>['getState'],
): LoanRepaySlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchDetailInfo: async (activeKey, api, market, maxSlippage, userState) => {
      const { detailInfo, detailInfoLeverage, formStatus, formValues, ...sliceState } = get()[sliceKey]
      const { signerAddress } = api
      const { isFullRepay, userBorrowed, userCollateral, stateCollateral } = formValues
      const { swapRequired, haveValues } = _parseValues(formValues)
      const storedDetailInfo = swapRequired ? detailInfoLeverage[activeKey] : detailInfo[activeKey]

      if (!signerAddress || !haveValues) return

      // loading
      sliceState.setStateByActiveKey(swapRequired ? 'detailInfoLeverage' : 'detailInfo', activeKey, {
        ...(storedDetailInfo ?? {}),
        loading: true,
      })

      let respError

      if (swapRequired) {
        const resp = await loanRepay.detailInfoLeverage(
          activeKey,
          api,
          market,
          stateCollateral,
          userCollateral,
          userBorrowed,
          maxSlippage,
          userState.debt,
        )
        sliceState.setStateByActiveKey('detailInfoLeverage', resp.activeKey, { ...resp.resp, error: resp.error })

        if (resp.resp && !resp.resp.repayIsAvailable && !resp.resp.repayIsFull) {
          sliceState.setStateByKey('formStatus', { ...formStatus, error: FormError.FullRepaymentRequired })
        } else {
          respError = resp.error
        }
      } else {
        const resp = await loanRepay.detailInfo(activeKey, api, market, userBorrowed, isFullRepay, userState.debt)
        sliceState.setStateByActiveKey('detailInfo', resp.activeKey, { ...resp.resp, error: resp.error })
        respError = resp.error
      }

      // set error to status
      if (respError) {
        sliceState.setStateByKey('formStatus', { ...formStatus, error: respError })
      }
    },
    fetchEstGasApproval: async (activeKey, api, market, maxSlippage) => {
      const { formStatus, formValues, ...sliceState } = get()[sliceKey]
      const { signerAddress } = api
      const { stateCollateral, userCollateral, userBorrowed, isFullRepay } = formValues
      const { swapRequired, haveValues, haveFormErrors } = _parseValues(formValues)

      if (!signerAddress || !haveValues || haveFormErrors) return

      sliceState.setStateByKey('formEstGas', { [activeKey]: { ...DEFAULT_FORM_EST_GAS, loading: true } })

      const resp = await loanRepay.estGasApproval(
        activeKey,
        market,
        stateCollateral,
        userCollateral,
        userBorrowed,
        isFullRepay,
        maxSlippage,
        swapRequired,
      )
      sliceState.setStateByKey('formEstGas', { [resp.activeKey]: { estimatedGas: resp.estimatedGas, loading: false } })

      // update formStatus
      sliceState.setStateByKey('formStatus', {
        ...formStatus,
        isApproved: resp.isApproved,
        error: formStatus.error || resp.error,
      })
    },
    setFormValues: async (api, market, partialFormValues, maxSlippage, _shouldRefetch) => {
      const { user } = get()
      const { formStatus, formValues, ...sliceState } = get()[sliceKey]

      // update activeKey, formStatus, formValues
      const cFormValues: FormValues = {
        ...formValues,
        ...partialFormValues,
        stateCollateralError: '',
        userBorrowedError: '',
        userCollateralError: '',
      }

      const cFormStatus: FormStatus = {
        ...DEFAULT_FORM_STATUS,
        isApproved: formStatus.isApproved,
        isApprovedCompleted: formStatus.isApprovedCompleted,
      }
      const activeKey = _getActiveKey(api, market, cFormValues, maxSlippage)
      sliceState.setStateByKeys({
        activeKey,
        formValues: lodash.cloneDeep(cFormValues),
        formStatus: lodash.cloneDeep(cFormStatus),
      })

      if (!api || !market) return

      const { signerAddress } = api

      if (!signerAddress) return

      const { stateCollateral, userBorrowed, userCollateral } = cFormValues

      let userState: UserLoanState
      try {
        userState = { ...(await market.userState()), error: '' }
      } catch (error) {
        userState = { collateral: '', borrowed: '', debt: '', N: '', error }
      }

      // validation
      const userBalancesResp = await user.fetchUserMarketBalances(api, market, true)
      cFormValues.stateCollateralError = isTooMuch(stateCollateral, userState.collateral) ? 'too-much-collateral' : ''
      cFormValues.userCollateralError = isTooMuch(userCollateral, userBalancesResp.collateral) ? 'too-much' : ''
      cFormValues.userBorrowedError = isTooMuch(userBorrowed, userBalancesResp.borrowed) ? 'too-much' : ''
      sliceState.setStateByKey('formValues', { ...cFormValues })

      // api calls
      await sliceState.fetchDetailInfo(activeKey, api, market, maxSlippage, userState)
      void sliceState.fetchEstGasApproval(activeKey, api, market, maxSlippage)
    },

    // steps
    fetchStepApprove: async (activeKey, api, market, formValues, maxSlippage) => {
      const sliceState = get()[sliceKey]
      const { provider } = useWallet.getState()
      if (!provider) return setMissingProvider(get()[sliceKey])

      // update formStatus
      sliceState.setStateByKey('formStatus', { ...DEFAULT_FORM_STATUS, isInProgress: true, step: 'APPROVAL' })

      const { stateCollateral, userCollateral, userBorrowed, isFullRepay } = formValues
      const { swapRequired } = _parseValues(formValues)

      const { error, ...resp } = await loanRepay.approve(
        activeKey,
        provider,
        market,
        stateCollateral,
        userCollateral,
        userBorrowed,
        isFullRepay,
        swapRequired,
      )

      if (resp.activeKey === get()[sliceKey].activeKey) {
        // update formStatus
        sliceState.setStateByKey('formStatus', {
          ...DEFAULT_FORM_STATUS,
          isApproved: !error,
          isApprovedCompleted: !error,
          stepError: error,
        })
        if (!error) void sliceState.fetchEstGasApproval(activeKey, api, market, maxSlippage)
        return { ...resp, error }
      }
    },
    fetchStepRepay: async (activeKey, api, market, formValues, maxSlippage) => {
      const { formStatus, ...sliceState } = get()[sliceKey]
      const { provider, wallet } = useWallet.getState()
      const { chainId } = api
      if (!provider || !wallet) return setMissingProvider(get()[sliceKey])

      // update formStatus
      sliceState.setStateByKey('formStatus', {
        ...DEFAULT_FORM_STATUS,
        isApproved: true,
        isApprovedCompleted: formStatus.isApprovedCompleted,
        isInProgress: true,
        step: 'REPAY',
      })

      const { userBorrowed, userCollateral, stateCollateral, isFullRepay } = formValues
      const { swapRequired } = _parseValues(formValues)

      const { error, ...resp } = await loanRepay.repay(
        activeKey,
        provider,
        market,
        stateCollateral,
        userCollateral,
        userBorrowed,
        isFullRepay,
        maxSlippage,
        swapRequired,
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
          return {
            ...resp,
            error,
            loanExists: await refetchLoanExists({
              chainId,
              marketId: market.id,
              userAddress: wallet?.address,
            }),
          }
        } else {
          const { loanExists } = await refetchUserMarket({ market, api })
          if (!loanExists) {
            const { user } = get()
            void user.fetchUserMarketBalances(api, market, true)
            user.setStateByActiveKey('loansDetailsMapper', getUserActiveKey(api, market), undefined)
          }

          // update formStatus
          sliceState.setStateByKeys({
            ...DEFAULT_STATE,
            formStatus: { ...DEFAULT_FORM_STATUS, isApproved: true, isComplete: true },
          })

          return { ...resp, error, loanExists }
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
      get().resetAppState(sliceKey, lodash.cloneDeep(DEFAULT_STATE))
    },
  },
})

function _getActiveKey(
  api: Api | null,
  market: OneWayMarketTemplate | undefined,
  formValues: FormValues,
  maxSlippage: string,
) {
  const { userBorrowed, userCollateral, stateCollateral, isFullRepay } = formValues
  const pIsFullRepay = isFullRepay ? 'full' : ''
  const { swapRequired } = _parseValues(formValues)
  const activeKey = _parseActiveKey(api, market)

  return swapRequired
    ? `${activeKey}leverage-${stateCollateral}-${userCollateral}-${userBorrowed}-${maxSlippage}`
    : `${activeKey}-${userBorrowed}-${pIsFullRepay}`
}
