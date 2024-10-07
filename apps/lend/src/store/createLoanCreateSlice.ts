import cloneDeep from 'lodash/cloneDeep'
import type { GetState, SetState } from 'zustand'
import type {
  FormEstGas,
  FormStatus,
  FormValues,
  DetailInfo,
  DetailInfoLeverage,
} from '@/components/PageLoanCreate/types'


import { DEFAULT_FORM_STATUS, DEFAULT_FORM_VALUES, _parseValue } from '@/components/PageLoanCreate/utils'
import { DEFAULT_FORM_EST_GAS } from '@/components/PageLoanManage/utils'
import apiLending, { helpers } from '@/lib/apiLending'
import type { LiqRange, LiqRangesMapper } from '@/store/types'
import type { State } from '@/store/useStore'
import { _parseActiveKey } from '@/utils/helpers'

type StateKey = keyof typeof DEFAULT_STATE

const sliceKey = 'loanCreate'

type SliceState = {
  activeKey: string
  activeKeyMax: string
  activeKeyLiqRange: string
  detailInfo: { [activeKey: string]: DetailInfo }
  detailInfoLeverage: { [activeKey: string]: DetailInfoLeverage }
  formEstGas: { [activeKey: string]: FormEstGas }
  formStatus: FormStatus
  formValues: FormValues
  liqRanges: { [activeKey: string]: LiqRange[] }
  liqRangesMapper: { [activeKey: string]: LiqRangesMapper }
  maxLeverage: { [n: string]: string }
  maxRecv: { [activeKey: string]: string }
  isEditLiqRange: boolean
}

// prettier-ignore
export type LoanCreateSlice = {
  [sliceKey]: SliceState & {
    fetchMaxLeverage(owmData: OWMData): Promise<void>
    fetchMaxRecv(activeKey: string, api: Api, owmData: OWMData, isLeverage: boolean): Promise<void>
    refetchMaxRecv(owmData: OWMData | undefined, isLeverage: boolean): Promise<string>
    fetchDetailInfo(activeKey: string, api: Api, owmData: OWMData, maxSlippage: string, isLeverage: boolean): Promise<void>
    fetchLiqRanges(activeKeyLiqRange: string, api: Api, owmData: OWMData, isLeverage: boolean): Promise<void>
    fetchEstGasApproval(activeKey: string, api: Api, owmData: OWMData, maxSlippage: string, isLeverage: boolean): Promise<void>
    setFormValues(api: Api | null, owmData: OWMData | undefined, partialFormValues: Partial<FormValues>, maxSlippage: string, isLeverage: boolean, shouldRefetch?: boolean): Promise<void>

    // steps
    fetchStepApprove(activeKey: string, api: Api, owmData: OWMData, maxSlippage: string, formValues: FormValues, isLeverage: boolean): Promise<{ hashes: string[]; activeKey: string; error: string } | undefined>
    fetchStepCreate(activeKey: string, api: Api, owmData: OWMData, maxSlippage: string, formValues: FormValues, isLeverage: boolean): Promise<{ activeKey: string; error: string; hash: string } | undefined>

    // steps helper
    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(params?: { rChainId: ChainId, rOwmId: string, key: string }): void
  }
}

const DEFAULT_STATE: SliceState = {
  activeKey: '',
  activeKeyMax: '',
  activeKeyLiqRange: '',
  detailInfo: {},
  detailInfoLeverage: {},
  formEstGas: {},
  formStatus: DEFAULT_FORM_STATUS,
  formValues: DEFAULT_FORM_VALUES,
  liqRanges: {},
  liqRangesMapper: {},
  maxLeverage: {},
  maxRecv: {},
  isEditLiqRange: false,
}

const { loanCreate } = apiLending
const { isTooMuch } = helpers

const createLoanCreate = (set: SetState<State>, get: GetState<State>): LoanCreateSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchMaxLeverage: async (owmData) => {
      const { formValues, ...sliceState } = get()[sliceKey]
      const { n } = formValues

      if (n === null) return

      const resp = await loanCreate.maxLeverage(owmData, n)
      sliceState.setStateByActiveKey('maxLeverage', n.toString(), resp.maxLeverage)
    },
    fetchMaxRecv: async (activeKey, api, owmData, isLeverage) => {
      const { maxRecv, formValues, ...sliceState } = get()[sliceKey]
      const { signerAddress } = api
      const { userCollateral, userBorrowed, n } = formValues
      const { haveValues } = _parseValue(formValues)

      let updatedMaxRecv = maxRecv[activeKey]

      if (n === null || !haveValues) return

      if (typeof updatedMaxRecv === 'undefined') {
        const resp = await loanCreate.maxRecv(activeKey, owmData, userCollateral, userBorrowed, n, isLeverage)
        updatedMaxRecv = resp.maxRecv
        sliceState.setStateByActiveKey('maxRecv', resp.activeKey, resp.maxRecv)
      }

      // validation
      if (signerAddress) {
        const debtError = isTooMuch(formValues.debt, updatedMaxRecv) ? 'too-much' : formValues.debtError
        sliceState.setStateByKey('formValues', { ...formValues, debtError })
      }
    },
    refetchMaxRecv: async (owmData, isLeverage) => {
      const { activeKeyMax, formValues, ...sliceState } = get()[sliceKey]
      const { userCollateral, userBorrowed, n } = formValues

      if (n === null || typeof owmData === 'undefined') return ''

      sliceState.setStateByActiveKey('maxRecv', activeKeyMax, '')
      const { maxRecv } = await loanCreate.maxRecv(activeKeyMax, owmData, userCollateral, userBorrowed, n, isLeverage)
      sliceState.setStateByActiveKey('maxRecv', activeKeyMax, maxRecv)
      return maxRecv
    },
    fetchDetailInfo: async (activeKey, api, owmData, maxSlippage, isLeverage) => {
      const { detailInfo, detailInfoLeverage, formStatus, formValues, ...sliceState } = get()[sliceKey]
      const { userCollateral, userBorrowed, debt, n } = formValues
      const { haveValues, haveDebt } = _parseValue(formValues)
      const storedDetailInfo = isLeverage ? detailInfoLeverage[activeKey] : detailInfo[activeKey]

      if (!haveValues || !haveDebt || n === null) return

      // loading
      sliceState.setStateByActiveKey(isLeverage ? 'detailInfoLeverage' : 'detailInfo', activeKey, {
        ...(storedDetailInfo ?? {}),
        loading: true,
      })

      if (isLeverage) {
        const resp = await loanCreate.detailInfoLeverage(
          activeKey,
          owmData,
          userCollateral,
          userBorrowed,
          debt,
          n,
          maxSlippage
        )
        sliceState.setStateByActiveKey('detailInfoLeverage', resp.activeKey, { ...resp.resp, error: resp.error })
        if (resp.error) sliceState.setStateByKey('formStatus', { ...formStatus, error: resp.error })
      } else {
        const resp = await loanCreate.detailInfo(activeKey, owmData, userCollateral, debt, n)
        sliceState.setStateByActiveKey('detailInfo', resp.activeKey, { ...resp.resp, error: resp.error })
        if (resp.error) sliceState.setStateByKey('formStatus', { ...formStatus, error: resp.error })
      }
    },
    fetchLiqRanges: async (activeKeyLiqRange, api, owmData, isLeverage) => {
      const { detailInfoLeverage, formValues, ...sliceState } = get()[sliceKey]
      const { userCollateral, userBorrowed, debt } = formValues
      const { totalCollateral } = detailInfoLeverage[activeKeyLiqRange]?.expectedCollateral ?? {}
      const { haveValues, haveDebt } = _parseValue(formValues)

      if (!haveValues || !haveDebt) return

      const resp = await loanCreate.liqRanges(
        activeKeyLiqRange,
        owmData,
        totalCollateral,
        userCollateral,
        userBorrowed,
        debt,
        isLeverage
      )
      sliceState.setStateByKey('liqRanges', { [activeKeyLiqRange]: resp.liqRanges })
      sliceState.setStateByKey('liqRangesMapper', { [activeKeyLiqRange]: resp.liqRangesMapper })
    },
    fetchEstGasApproval: async (activeKey, api, owmData, maxSlippage, isLeverage) => {
      const { gas } = get()
      const { formStatus, formValues, ...sliceState } = get()[sliceKey]
      const { signerAddress } = api
      const { userCollateral, userBorrowed, debt, n } = formValues
      const { haveDebt } = _parseValue(formValues)

      if (!signerAddress || !haveDebt || n === null) return

      sliceState.setStateByKey('formEstGas', { [activeKey]: { ...DEFAULT_FORM_EST_GAS, loading: true } })
      await gas.fetchGasInfo(api)
      const resp = await loanCreate.estGasApproval(
        activeKey,
        owmData,
        userCollateral,
        userBorrowed,
        debt,
        n,
        maxSlippage,
        isLeverage
      )
      sliceState.setStateByKey('formEstGas', { [resp.activeKey]: { estimatedGas: resp.estimatedGas, loading: false } })

      // update formStatus
      sliceState.setStateByKey('formStatus', {
        ...formStatus,
        isApproved: resp.isApproved,
        error: formStatus.error || resp.error,
      })
    },
    setFormValues: async (api, owmData, partialFormValues, maxSlippage, isLeverage, shouldRefetch) => {
      const { user } = get()
      const { formStatus, formValues, ...sliceState } = get()[sliceKey]

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
      let activeKeys = _getActiveKey(api, owmData, cFormValues, maxSlippage)
      sliceState.setStateByKeys({ ...activeKeys, formValues: { ...cFormValues }, formStatus: cFormStatus })

      if (!api || !owmData) return

      const { signerAddress } = api
      const { owm } = owmData

      // set default N
      cFormValues.n = cFormValues.n || owm.defaultBands
      activeKeys = _getActiveKey(api, owmData, cFormValues, maxSlippage)
      sliceState.setStateByKeys({ ...activeKeys, formValues: { ...cFormValues } })

      if (signerAddress) {
        // validation
        const userBalances = await user.fetchUserMarketBalances(api, owmData, shouldRefetch)
        const userCollateralError = isTooMuch(cFormValues.userCollateral, userBalances?.collateral) ? 'too-much' : ''
        const userBorrowedError = isTooMuch(cFormValues.userBorrowed, userBalances?.borrowed) ? 'too-much' : ''
        sliceState.setStateByKeys({
          ...activeKeys,
          formValues: { ...cFormValues, userCollateralError, userBorrowedError },
        })
      }

      // api calls
      if (isLeverage) sliceState.fetchMaxLeverage(owmData)
      await sliceState.fetchMaxRecv(activeKeys.activeKeyMax, api, owmData, isLeverage)
      await sliceState.fetchDetailInfo(activeKeys.activeKey, api, owmData, maxSlippage, isLeverage)
      sliceState.fetchEstGasApproval(activeKeys.activeKey, api, owmData, maxSlippage, isLeverage)
      sliceState.fetchLiqRanges(activeKeys.activeKeyLiqRange, api, owmData, isLeverage)
    },

    // steps
    fetchStepApprove: async (activeKey, api, owmData, maxSlippage, formValues, isLeverage) => {
      const { gas, wallet } = get()
      const { formStatus, ...sliceState } = get()[sliceKey]
      const provider = wallet.getProvider(sliceKey)

      if (!provider) return

      // update formStatus
      sliceState.setStateByKey('formStatus', { ...DEFAULT_FORM_STATUS, isInProgress: true, step: 'APPROVAL' })

      // api calls
      await gas.fetchGasInfo(api)
      const { userCollateral, userBorrowed } = formValues
      const { error, ...resp } = await loanCreate.approve(
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
    fetchStepCreate: async (activeKey, api, owmData, maxSlippage, formValues, isLeverage) => {
      const { gas, markets, wallet, user } = get()
      const { formStatus, ...sliceState } = get()[sliceKey]
      const { userCollateral, userBorrowed, debt, n } = formValues
      const provider = wallet.getProvider(sliceKey)

      if (!provider || n === null) return

      // update formStatus
      sliceState.setStateByKey('formStatus', {
        ...DEFAULT_FORM_STATUS,
        isApproved: true,
        isApprovedCompleted: formStatus.isApprovedCompleted,
        isInProgress: true,
        step: 'CREATE',
      })

      await gas.fetchGasInfo(api)
      const { error, ...resp } = await loanCreate.create(
        activeKey,
        provider,
        owmData,
        userCollateral,
        userBorrowed,
        debt,
        n,
        maxSlippage,
        isLeverage
      )

      if (resp.activeKey === get()[sliceKey].activeKey) {
        if (error) {
          sliceState.setStateByKey('formStatus', { ...formStatus, isInProgress: false, step: '', stepError: error })
          return { ...resp, error }
        } else {
          const loanExits = (await user.fetchUserLoanExists(api, owmData, true))?.loanExists
          if (loanExits) {
            // api calls
            await user.fetchAll(api, owmData, true)
            markets.fetchAll(api, owmData, true)
            markets.setStateByKey('marketDetailsView', 'user')

            // update formStatus
            sliceState.setStateByKeys({
              ...DEFAULT_STATE,
              formStatus: { ...DEFAULT_FORM_STATUS, isApproved: true, isComplete: true },
            })
          }
          return { ...resp, error }
        }
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

export function _getActiveKey(
  api: Api | null,
  owmData: OWMData | undefined,
  { userCollateral, userBorrowed, debt, n }: FormValues,
  maxSlippage: string
) {
  let activeKey = `${_parseActiveKey(api, owmData)}${n}`
  return {
    activeKey: `${activeKey}-${userCollateral}-${userBorrowed}-${debt}-${maxSlippage}`,
    activeKeyMax: `${activeKey}-${userCollateral}-${userBorrowed}`,
    activeKeyLiqRange: `${activeKey}-${userCollateral}-${userBorrowed}-${debt}`,
  }
}

export default createLoanCreate
