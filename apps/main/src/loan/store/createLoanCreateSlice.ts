import cloneDeep from 'lodash/cloneDeep'
import type { GetState, SetState } from 'zustand'
import type {
  FormDetailInfoLeverage,
  FormStatus,
  FormValues,
  MaxRecvLeverage,
} from '@/loan/components/PageLoanCreate/types'
import {
  DEFAULT_DETAIL_INFO_LEVERAGE,
  DEFAULT_FORM_STATUS,
  DEFAULT_FORM_VALUES,
} from '@/loan/components/PageLoanCreate/utils'
import type { FormDetailInfo, FormEstGas } from '@/loan/components/PageLoanManage/types'
import { DEFAULT_DETAIL_INFO, DEFAULT_FORM_EST_GAS } from '@/loan/components/PageLoanManage/utils'
import networks from '@/loan/networks'
import type { LiqRange, LiqRangesMapper } from '@/loan/store/types'
import type { State } from '@/loan/store/useStore'
import { ChainId, Curve, Llamma } from '@/loan/types/loan.types'
import { loadingLRPrices } from '@/loan/utils/utilsCurvejs'
import { setMissingProvider, useWallet } from '@ui-kit/features/connect-wallet'

type StateKey = keyof typeof DEFAULT_STATE

const sliceKey = 'loanCreate'

type SliceState = {
  activeKey: string
  activeKeyLiqRange: string
  detailInfo: { [activeKey: string]: FormDetailInfo }
  detailInfoLeverage: { [activeKey: string]: FormDetailInfoLeverage }
  formEstGas: { [activeKey: string]: FormEstGas }
  formStatus: FormStatus
  formValues: FormValues
  liqRanges: { [activeKey: string]: LiqRange[] }
  liqRangesMapper: { [activeKey: string]: LiqRangesMapper }
  maxRecv: { [activeKey: string]: string }
  maxRecvLeverage: { [activeKey: string]: MaxRecvLeverage }
  isEditLiqRange: boolean
}

export type LoanCreateSlice = {
  [sliceKey]: SliceState & {
    fetchEstGasApproval(
      activeKey: string,
      chainId: ChainId,
      isLeverage: boolean,
      llamma: Llamma,
      formValues: FormValues,
      maxSlippage: string,
    ): Promise<void>
    fetchDetailInfo(
      activeKey: string,
      chainId: ChainId,
      isLeverage: boolean,
      llamma: Llamma,
      formValues: FormValues,
      address: string | undefined,
      maxSlippage: string,
    ): Promise<void>
    fetchLiqRanges(
      activeKeyLiqRange: string,
      chainId: ChainId,
      isLeverage: boolean,
      llamma: Llamma,
      formValues: FormValues,
    ): Promise<void>
    fetchMaxRecv(
      activeKey: string,
      chainId: ChainId,
      isLeverage: boolean,
      llamma: Llamma,
      formValues: FormValues,
    ): Promise<{ maxRecv: string; activeKey: string; error: string } | undefined>
    setFormValues(
      curve: Curve,
      isLeverage: boolean,
      llamma: Llamma,
      formValues: FormValues,
      maxSlippage: string,
    ): Promise<void>

    // steps
    fetchStepApprove(
      activeKey: string,
      curve: Curve,
      isLeverage: boolean,
      llamma: Llamma,
      formValues: FormValues,
      maxSlippage: string,
    ): Promise<{ hashes: string[]; activeKey: string; error: string } | undefined>
    fetchStepCreate(
      activeKey: string,
      curve: Curve,
      isLeverage: boolean,
      llamma: Llamma,
      formValues: FormValues,
      maxSlippage: string,
    ): Promise<{ activeKey: string; error: string; hash: string } | undefined>

    // steps helper
    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(isLeverage?: boolean): void
  }
}

const DEFAULT_STATE: SliceState = {
  activeKey: '',
  activeKeyLiqRange: '',
  detailInfo: {},
  detailInfoLeverage: {},
  formEstGas: {},
  formStatus: DEFAULT_FORM_STATUS,
  formValues: DEFAULT_FORM_VALUES,
  liqRanges: {},
  liqRangesMapper: {},
  maxRecv: {},
  maxRecvLeverage: {},
  isEditLiqRange: false,
}

const createLoanCreate = (set: SetState<State>, get: GetState<State>) => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchEstGasApproval: async (
      activeKey: string,
      chainId: ChainId,
      isLeverage: boolean,
      llamma: Llamma,
      formValues: FormValues,
      maxSlippage: string,
    ) => {
      const { collateral, debt, n } = formValues
      if (n !== null) {
        const estGasApprovalFn = networks[chainId].api.loanCreate.estGasApproval
        const resp = await estGasApprovalFn(activeKey, llamma, isLeverage, collateral, debt, n, maxSlippage)

        get()[sliceKey].setStateByActiveKey('formEstGas', resp.activeKey, { estimatedGas: resp.estimatedGas })

        // update formStatus
        const clonedFormStatus = cloneDeep(get()[sliceKey].formStatus)
        clonedFormStatus.isApproved = resp.isApproved

        if (!clonedFormStatus.error) {
          clonedFormStatus.error = resp.error
        }
        get()[sliceKey].setStateByKey('formStatus', clonedFormStatus)
      }
    },
    fetchDetailInfo: async (
      activeKey: string,
      chainId: ChainId,
      isLeverage: boolean,
      llamma: Llamma,
      formValues: FormValues,
      address: string | undefined,
      maxSlippage: string,
    ) => {
      const { collateral, debt, n } = formValues
      if (n !== null) {
        const detailInfoFn = networks[chainId].api.loanCreate.detailInfo
        const detailInfoLeverageFn = networks[chainId].api.loanCreate.detailInfoLeverage
        const resp = isLeverage
          ? await detailInfoLeverageFn(activeKey, llamma, collateral, debt, n, maxSlippage)
          : await detailInfoFn(activeKey, llamma, collateral, debt, n, address)

        const key = isLeverage ? 'detailInfoLeverage' : 'detailInfo'
        get()[sliceKey].setStateByActiveKey(key, resp.activeKey, { ...resp.resp, loading: false })
      }
    },
    fetchLiqRanges: async (
      activeKeyLiqRange: string,
      chainId: ChainId,
      isLeverage: boolean,
      llamma: Llamma,
      formValues: FormValues,
    ) => {
      const { collateral, debt } = formValues
      const liqRangesFn = networks[chainId].api.loanCreate.liqRanges
      const resp = await liqRangesFn(activeKeyLiqRange, llamma, isLeverage, collateral, debt)

      get()[sliceKey].setStateByKey('liqRanges', { [activeKeyLiqRange]: resp.liqRanges })
      get()[sliceKey].setStateByKey('liqRangesMapper', { [activeKeyLiqRange]: resp.liqRangesMapper })
    },
    fetchMaxRecv: async (
      activeKey: string,
      chainId: ChainId,
      isLeverage: boolean,
      llamma: Llamma,
      formValues: FormValues,
    ) => {
      const { collateral, n } = formValues
      if (n !== null) {
        if (isLeverage) {
          const maxRecvLeverageFn = networks[chainId].api.loanCreate.maxRecvLeverage
          const resp = await maxRecvLeverageFn(activeKey, llamma, collateral, n)
          get()[sliceKey].setStateByActiveKey('maxRecvLeverage', resp.activeKey, resp.resp)
          return { activeKey: resp.activeKey, maxRecv: resp.resp.maxBorrowable, error: resp.error }
        } else {
          const maxRecvFn = networks[chainId].api.loanCreate.maxRecv
          const resp = await maxRecvFn(activeKey, llamma, collateral, n)
          get()[sliceKey].setStateByActiveKey('maxRecv', resp.activeKey, resp.maxRecv)
          return resp
        }
      }
    },
    setFormValues: async (
      curve: Curve,
      isLeverage: boolean,
      llamma: Llamma,
      formValues: FormValues,
      maxSlippage: string,
    ) => {
      const chainId = curve.chainId
      const signerAddress = curve.signerAddress
      // stored values
      const prevActiveKey = get()[sliceKey].activeKey
      const storedFormEstGas = get()[sliceKey].formEstGas
      const storedFormValues = get()[sliceKey].formValues
      const storedDetailInfo = get()[sliceKey].detailInfo
      const storedDetailInfoLeverage = get()[sliceKey].detailInfoLeverage

      const clonedFormValues = cloneDeep(formValues)

      // check if loan exists
      const loanExists = get().loans.existsMapper[llamma.id]?.loanExists
      if (loanExists) {
        get()[sliceKey].setStateByKeys({
          formValues: clonedFormValues,
          formStatus: { ...get()[sliceKey].formStatus, warning: 'warning-loan-exists' },
        })
      } else {
        // set default N
        if (!clonedFormValues.n) {
          clonedFormValues.n = llamma.defaultBands
        }

        const { activeKey, activeKeyLiqRange } = getCreateLoanActiveKey(
          llamma,
          clonedFormValues,
          isLeverage,
          maxSlippage,
        )
        const haveCollateral = +clonedFormValues.collateral > 0
        const haveDebt = +clonedFormValues.debt > 0

        // validate collateral
        const userCollateral = get().loans.userWalletBalancesMapper[llamma.id]?.collateral ?? '0'
        const collateralError = +clonedFormValues.collateral > +userCollateral ? 'too-much' : ''
        clonedFormValues.collateralError = collateralError

        // update loading est gas and detail info
        const loadingFormEstGas = storedFormEstGas[activeKey] ??
          storedFormEstGas[prevActiveKey] ?? { ...DEFAULT_FORM_EST_GAS, loading: true }

        const loadingDetailInfo = isLeverage
          ? cloneDeep(
              storedDetailInfoLeverage[activeKey] ??
                storedDetailInfoLeverage[prevActiveKey] ??
                DEFAULT_DETAIL_INFO_LEVERAGE,
            )
          : cloneDeep(storedDetailInfo[activeKey] ?? storedDetailInfo[prevActiveKey] ?? DEFAULT_DETAIL_INFO)
        const parsedPrices = loadingLRPrices(loadingDetailInfo.prices)
        if (parsedPrices) loadingDetailInfo.prices = parsedPrices
        loadingDetailInfo.loading = true

        get()[sliceKey].setStateByActiveKey('formEstGas', activeKey, loadingFormEstGas)
        get()[sliceKey].setStateByActiveKey(
          isLeverage ? 'detailInfoLeverage' : 'detailInfo',
          activeKey,
          loadingDetailInfo,
        )

        // update form values
        get()[sliceKey].setStateByKeys({ activeKey, activeKeyLiqRange, formValues: clonedFormValues })

        // update maxRecv
        let maxRecv = isLeverage
          ? get()[sliceKey].maxRecvLeverage[activeKey]?.maxBorrowable
          : get()[sliceKey].maxRecv[activeKey]

        if (!maxRecv && +formValues.collateral > 0) {
          const fetchedMaxRecv = await get()[sliceKey].fetchMaxRecv(
            activeKey,
            chainId,
            isLeverage,
            llamma,
            clonedFormValues,
          )
          if (fetchedMaxRecv && fetchedMaxRecv.activeKey === activeKey) {
            maxRecv = fetchedMaxRecv.maxRecv
          }
        }

        // update debtError
        const debtError = maxRecv && +maxRecv > 0 ? (+formValues.debt > +maxRecv ? 'too-much' : '') : ''
        get()[sliceKey].setStateByKey('formValues', { ...clonedFormValues, debtError })

        // fetch liq ranges
        if (
          storedFormValues.collateral !== formValues.collateral ||
          storedFormValues.debt !== formValues.debt ||
          !get()[sliceKey].liqRangesMapper[activeKeyLiqRange]
        ) {
          get()[sliceKey].fetchLiqRanges(activeKeyLiqRange, chainId, isLeverage, llamma, clonedFormValues)
        }

        // fetch approval and estimate gas, detail
        if (haveDebt && !debtError && haveCollateral) {
          if (signerAddress && !collateralError) {
            get()[sliceKey].setStateByActiveKey('formEstGas', activeKey, {
              ...DEFAULT_FORM_EST_GAS,
              ...get()[sliceKey].formEstGas[activeKey],
              loading: true,
            })
          }

          // fetch detail info
          get()[sliceKey].fetchDetailInfo(
            activeKey,
            chainId,
            isLeverage,
            llamma,
            clonedFormValues,
            signerAddress,
            maxSlippage,
          )

          if (signerAddress && !collateralError) {
            get()[sliceKey].fetchEstGasApproval(activeKey, chainId, isLeverage, llamma, clonedFormValues, maxSlippage)
          }
        } else {
          if (isLeverage) {
            get()[sliceKey].setStateByActiveKey('detailInfoLeverage', activeKey, DEFAULT_DETAIL_INFO_LEVERAGE)
          } else {
            get()[sliceKey].setStateByActiveKey('detailInfo', activeKey, DEFAULT_DETAIL_INFO)
          }

          get()[sliceKey].setStateByActiveKey('formEstGas', activeKey, DEFAULT_FORM_EST_GAS)
          get()[sliceKey].setStateByKey('formStatus', { ...get()[sliceKey].formStatus, error: '' })
        }

        if (debtError) {
          if (isLeverage) {
            get()[sliceKey].setStateByActiveKey('detailInfoLeverage', activeKey, DEFAULT_DETAIL_INFO_LEVERAGE)
          } else {
            get()[sliceKey].setStateByActiveKey('detailInfo', activeKey, DEFAULT_DETAIL_INFO)
          }
        } else if (collateralError) {
          get()[sliceKey].setStateByActiveKey('formEstGas', activeKey, DEFAULT_FORM_EST_GAS)
        }
      }
    },

    // steps
    fetchStepApprove: async (
      activeKey: string,
      curve: Curve,
      isLeverage: boolean,
      llamma: Llamma,
      formValues: FormValues,
      maxSlippage: string,
    ) => {
      const { provider } = useWallet.getState()
      if (!provider) return setMissingProvider(get()[sliceKey])

      get()[sliceKey].setStateByKey('formStatus', {
        ...get()[sliceKey].formStatus,
        isInProgress: true,
        step: 'APPROVAL',
      })
      await get().gas.fetchGasInfo(curve)
      const chainId = curve.chainId
      const { collateral } = formValues
      const approveFn = networks[chainId].api.loanCreate.approve
      const resp = await approveFn(activeKey, provider, llamma, isLeverage, collateral)
      if (resp.activeKey === get()[sliceKey].activeKey) {
        get()[sliceKey].setStateByKey('formStatus', {
          ...get()[sliceKey].formStatus,
          isApproved: !resp.error,
          step: '',
          formProcessing: !resp.error,
          error: resp.error,
        })

        get()[sliceKey].fetchEstGasApproval(activeKey, chainId, isLeverage, llamma, formValues, maxSlippage)

        return resp
      }
    },
    fetchStepCreate: async (
      activeKey: string,
      curve: Curve,
      isLeverage: boolean,
      llamma: Llamma,
      formValues: FormValues,
      maxSlippage: string,
    ) => {
      const chainId = curve.chainId
      const { provider } = useWallet.getState()
      if (!provider) return setMissingProvider(get()[sliceKey])

      get()[sliceKey].setStateByKey('formStatus', {
        ...get()[sliceKey].formStatus,
        isInProgress: true,
        step: 'CREATE',
      })
      await get().gas.fetchGasInfo(curve)
      const { collateral, debt, n } = formValues
      if (n !== null) {
        const createFn = networks[chainId].api.loanCreate.create
        const resp = await createFn(activeKey, provider, llamma, isLeverage, collateral, debt, n, maxSlippage)

        if (resp.activeKey === get()[sliceKey].activeKey) {
          get()[sliceKey].setStateByKeys({
            liqRanges: {},
            liqRangesMapper: {},
          })

          // re-fetch loan info
          const { loanExists } = await get().loans.fetchLoanDetails(curve, llamma)

          if (!loanExists.loanExists) {
            get().loans.resetUserDetailsState(llamma)
          }

          // reset form values
          const updatedFormValues = DEFAULT_FORM_VALUES
          get()[sliceKey].setStateByKeys({
            ...getCreateLoanActiveKey(llamma, updatedFormValues, isLeverage, maxSlippage),
            isEditLiqRange: false,
            formStatus: {
              ...get()[sliceKey].formStatus,
              error: resp.error,
              isInProgress: false,
              isComplete: !resp.error,
              step: '',
            },
            formValues: updatedFormValues,
            maxRecv: {},
          })

          return { ...resp, loanExists: loanExists.loanExists }
        }
      }
    },

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

export function getCreateLoanActiveKey(
  llamma: Llamma,
  { collateral, debt, n }: FormValues,
  isLeverage: boolean,
  maxSlippage: string,
) {
  const activeKeyLiqRange = `${llamma.id}-${isLeverage ? 'leverage-' : ''}${collateral}-${debt}`
  return {
    activeKey: `${activeKeyLiqRange}-${n}-${maxSlippage}`,
    activeKeyLiqRange,
  }
}

export default createLoanCreate
