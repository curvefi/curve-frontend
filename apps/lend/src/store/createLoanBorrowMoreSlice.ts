import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type { FormDetailInfo, FormEstGas } from '@/components/PageLoanManage/types'
import type { FormDetailInfoLeverage, FormStatus, FormValues } from '@/components/PageLoanManage/LoanBorrowMore/types'

import cloneDeep from 'lodash/cloneDeep'

import { DEFAULT_FORM_EST_GAS } from '@/components/PageLoanManage/utils'
import {
  DEFAULT_FORM_STATUS,
  DEFAULT_FORM_VALUES,
  _parseValues,
} from '@/components/PageLoanManage/LoanBorrowMore/utils'
import { _parseActiveKey } from '@/utils/helpers'
import apiLending, { helpers } from '@/lib/apiLending'

type StateKey = keyof typeof DEFAULT_STATE

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
    fetchMaxRecv(activeKeyMax: string, api: Api, owmData: OWMData, isLeverage: boolean): Promise<void>
    refetchMaxRecv(owmData: OWMData | undefined, isLeverage: boolean): Promise<string>
    fetchDetailInfo(activeKey: string, api: Api, owmData: OWMData, maxSlippage: string, isLeverage: boolean): Promise<void>
    fetchEstGasApproval(activeKey: string, api: Api, owmData: OWMData, maxSlippage: string, isLeverage: boolean): Promise<void>
    setFormValues(api: Api | null, owmData: OWMData | undefined, partialFormValues: Partial<FormValues>, maxSlippage: string, isLeverage: boolean, shouldRefetch?: boolean): Promise<void>

    // steps
    fetchStepApprove(activeKey: string, api: Api, owmData: OWMData, formValues: FormValues, maxSlippage: string, isLeverage: boolean): Promise<{ hashes: string[]; error: string } | undefined>
    fetchStepIncrease(activeKey: string, api: Api, owmData: OWMData, formValues: FormValues, maxSlippage: string, isLeverage: boolean): Promise<{ activeKey: string; error: string; hash: string } | undefined>

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

const createLoanBorrowMore = (_: SetState<State>, get: GetState<State>): LoanBorrowMoreSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchMaxRecv: async (activeKeyMax, api, owmData, isLeverage) => {
      const { maxRecv, formValues, ...sliceState } = get()[sliceKey]
      const { signerAddress } = api
      const { userCollateral, userBorrowed } = formValues

      let updatedMaxRecv = maxRecv[activeKeyMax]

      if (!signerAddress) return

      if (typeof updatedMaxRecv === 'undefined') {
        if (isLeverage) {
          const resp = await loanBorrowMore.maxRecvLeverage(owmData, activeKeyMax, userCollateral, userBorrowed)
          updatedMaxRecv = resp.maxRecv?.maxDebt ?? ''
          sliceState.setStateByActiveKey('maxRecv', resp.activeKey, updatedMaxRecv)
        } else {
          const resp = await loanBorrowMore.maxRecv(owmData, activeKeyMax, userCollateral)
          updatedMaxRecv = resp.maxRecv
          sliceState.setStateByActiveKey('maxRecv', resp.activeKey, updatedMaxRecv)
        }
      }

      // validation
      const debtError = isTooMuch(formValues.debt, updatedMaxRecv) ? 'too-much' : formValues.debtError
      sliceState.setStateByKey('formValues', { ...formValues, debtError })
    },
    refetchMaxRecv: async (owmData, isLeverage) => {
      const { api } = get()
      const { activeKeyMax, formValues, ...sliceState } = get()[sliceKey]
      const { userCollateral, userBorrowed } = formValues

      if (!owmData || !api) return ''

      const { signerAddress } = api

      if (!signerAddress) return ''

      // loading
      sliceState.setStateByActiveKey('maxRecv', activeKeyMax, '')

      if (isLeverage) {
        const resp = await loanBorrowMore.maxRecvLeverage(owmData, activeKeyMax, userCollateral, userBorrowed)
        const maxDebt = resp.maxRecv?.maxDebt ?? ''
        sliceState.setStateByActiveKey('maxRecv', resp.activeKey, maxDebt)
        return maxDebt
      } else {
        const resp = await loanBorrowMore.maxRecv(owmData, activeKeyMax, userCollateral)
        sliceState.setStateByActiveKey('maxRecv', resp.activeKey, resp.maxRecv)
        return resp.maxRecv
      }
    },
    fetchDetailInfo: async (activeKey, api, owmData, maxSlippage, isLeverage) => {
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
          owmData,
          userCollateral,
          userBorrowed,
          debt,
          maxSlippage
        )
        sliceState.setStateByActiveKey('detailInfoLeverage', resp.activeKey, { ...resp.resp, error: resp.error })
      } else {
        const resp = await loanBorrowMore.detailInfo(activeKey, api, owmData, userCollateral, debt)
        sliceState.setStateByActiveKey('detailInfo', resp.activeKey, { ...resp.resp, error: resp.error })
      }
    },
    fetchEstGasApproval: async (activeKey, api, owmData, maxSlippage, isLeverage) => {
      const { gas } = get()
      const { formStatus, formValues, ...sliceState } = get()[sliceKey]
      const { signerAddress } = api
      const { userCollateral, userBorrowed, debt } = formValues
      const { haveDebt } = _parseValues(formValues)

      if (!signerAddress || !haveDebt) return

      sliceState.setStateByKey('formEstGas', { [activeKey]: { ...DEFAULT_FORM_EST_GAS, loading: true } })
      await gas.fetchGasInfo(api)
      const resp = await loanBorrowMore.estGasApproval(
        activeKey,
        owmData,
        userCollateral,
        userBorrowed,
        debt,
        maxSlippage,
        isLeverage
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
    setFormValues: async (api, owmData, partialFormValues, maxSlippage, isLeverage, shouldRefetch) => {
      const { user } = get()
      const { formStatus, formValues, maxRecv, ...sliceState } = get()[sliceKey]

      // update activeKey, formValues
      let cFormValues: FormValues = {
        ...formValues,
        ...partialFormValues,
        userCollateralError: '',
        userBorrowedError: '',
        debtError: '',
      }
      let cFormStatus: FormStatus = {
        ...DEFAULT_FORM_STATUS,
        isApproved: formStatus.isApproved,
        isApprovedCompleted: formStatus.isApprovedCompleted,
      }
      const activeKey = _getActiveKeys(api, owmData, cFormValues, isLeverage, maxSlippage)
      sliceState.setStateByKeys({ ...activeKey, formValues: cFormValues, formStatus: cFormStatus })

      if (!api || !owmData) return

      const { signerAddress } = api

      // validation
      if (signerAddress) {
        const userBalances = await user.fetchUserMarketBalances(api, owmData, shouldRefetch)
        const userCollateralError = isTooMuch(cFormValues.userCollateral, userBalances?.collateral) ? 'too-much' : ''
        const userBorrowedError = isTooMuch(cFormValues.userBorrowed, userBalances?.borrowed) ? 'too-much' : ''
        sliceState.setStateByKey('formValues', { ...cFormValues, userCollateralError, userBorrowedError })
      }

      // api calls
      await sliceState.fetchMaxRecv(activeKey.activeKeyMax, api, owmData, isLeverage)
      await sliceState.fetchDetailInfo(activeKey.activeKey, api, owmData, maxSlippage, isLeverage)
      sliceState.fetchEstGasApproval(activeKey.activeKey, api, owmData, maxSlippage, isLeverage)
    },

    // steps
    fetchStepApprove: async (activeKey, api, owmData, formValues, maxSlippage, isLeverage) => {
      const { gas, wallet } = get()
      const sliceState = get()[sliceKey]
      const provider = wallet.getProvider(sliceKey)

      if (!provider) return

      // update formStatus
      sliceState.setStateByKey('formStatus', { ...DEFAULT_FORM_STATUS, isInProgress: true, step: 'APPROVAL' })

      // api calls
      await gas.fetchGasInfo(api)
      const { userCollateral, userBorrowed } = formValues
      const { error, ...resp } = await loanBorrowMore.approve(
        activeKey,
        provider,
        owmData,
        userCollateral,
        userBorrowed,
        isLeverage
      )

      if (resp.activeKey === get()[sliceKey].activeKey) {
        // update formStatus
        sliceState.setStateByKey('formStatus', {
          ...DEFAULT_FORM_STATUS,
          isApproved: !error,
          isApprovedCompleted: !error,
          stepError: error,
        })
        if (!error) sliceState.fetchEstGasApproval(activeKey, api, owmData, maxSlippage, isLeverage)
        return { ...resp, error }
      }
    },
    fetchStepIncrease: async (activeKey, api, owmData, formValues, maxSlippage, isLeverage) => {
      const { gas, markets, wallet, user } = get()
      const { formStatus, ...sliceState } = get()[sliceKey]
      const provider = wallet.getProvider(sliceKey)

      if (!provider) return

      // loading
      sliceState.setStateByKey('formStatus', {
        ...DEFAULT_FORM_STATUS,
        isApproved: true,
        isApprovedCompleted: formStatus.isApprovedCompleted,
        isInProgress: true,
        step: 'BORROW_MORE',
      })

      // api call
      await gas.fetchGasInfo(api)
      const { userCollateral, userBorrowed, debt } = formValues
      const { error, ...resp } = await loanBorrowMore.borrowMore(
        activeKey,
        provider,
        owmData,
        userCollateral,
        userBorrowed,
        debt,
        maxSlippage,
        isLeverage
      )

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
          // api calls
          const loanExists = (await user.fetchUserLoanExists(api, owmData, true))?.loanExists
          if (loanExists) user.fetchAll(api, owmData, true)
          markets.fetchAll(api, owmData, true)

          // update formStatus
          sliceState.setStateByKeys({
            ...DEFAULT_STATE,
            formStatus: { ...DEFAULT_FORM_STATUS, isApproved: true, isComplete: true },
          })
          sliceState.setFormValues(api, owmData, DEFAULT_FORM_VALUES, maxSlippage, isLeverage)
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
    setStateByKeys: <T>(sliceState: Partial<SliceState>) => {
      get().setAppStateByKeys(sliceKey, sliceState)
    },
    resetState: () => {
      get().resetAppState(sliceKey, cloneDeep(DEFAULT_STATE))
    },
  },
})

export default createLoanBorrowMore

export function _getActiveKeys(
  api: Api | null,
  owmData: OWMData | undefined,
  { userCollateral, userBorrowed, debt }: FormValues,
  isLeverage: boolean,
  maxSlippage: string
) {
  const leverageKey = isLeverage ? 'leverage' : ''
  const activeKey = `${_parseActiveKey(api, owmData)}${leverageKey}`

  return {
    activeKey: `${activeKey}-${userCollateral}-${userBorrowed}-${debt}-${maxSlippage}`,
    activeKeyMax: `${activeKey}-${userCollateral}`,
  }
}
