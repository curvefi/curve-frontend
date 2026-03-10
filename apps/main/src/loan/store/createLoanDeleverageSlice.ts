import lodash from 'lodash'
import type { StoreApi } from 'zustand'
import { updateUserEventsApi } from '@/llamalend/llama.utils'
import { invalidateAllUserMarketDetails } from '@/llamalend/queries/user/invalidation'
import type { FormDetailInfo, FormStatus, FormValues } from '@/loan/components/PageMintMarket/LoanDeleverage/types'
import {
  DEFAULT_DETAIL_INFO,
  DEFAULT_FORM_STATUS,
  DEFAULT_FORM_VALUES,
} from '@/loan/components/PageMintMarket/LoanDeleverage/utils'
import type { FormEstGas } from '@/loan/components/PageMintMarket/types'
import { DEFAULT_FORM_EST_GAS } from '@/loan/components/PageMintMarket/utils'
import { networks } from '@/loan/networks'
import type { State } from '@/loan/store/useStore'
import { ChainId, LlamaApi, Llamma, UserLoanDetails } from '@/loan/types/loan.types'
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

const sliceKey = 'loanDeleverage'

// prettier-ignore
export type LoanDeleverageSlice = {
  [sliceKey]: SliceState & {
    fetchDetailInfo(activeKey: string, curve: LlamaApi, llamma: Llamma, formValues: FormValues, maxSlippage: string, userState: UserLoanDetails['userState']): Promise<FormDetailInfo>
    setFormValues(llammaId: string, curve: LlamaApi | null, llamma: Llamma | null, formValues: Partial<FormValues>, maxSlippage: string, isFullReset?: boolean): Promise<void>
    fetchEstGas(activeKey: string, chainId: ChainId, llamma: Llamma, formValues: FormValues, maxSlippage: string): Promise<void>
    fetchStepRepay(activeKey: string, curve: LlamaApi, llamma: Llamma, formValues: FormValues, maxSlippage: string): Promise<{ activeKey: string; error: string; hash: string; loanExists: boolean } | undefined>
    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  activeKey: '',
  detailInfo: {},
  formEstGas: {},
  formStatus: DEFAULT_FORM_STATUS,
  formValues: DEFAULT_FORM_VALUES,
}

export const createLoanDeleverageSlice = (
  _set: StoreApi<State>['setState'],
  get: StoreApi<State>['getState'],
): LoanDeleverageSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,
    fetchDetailInfo: async (activeKey, curve, llamma, formValues, maxSlippage, userState) => {
      const { collateral } = formValues
      const { chainId, signerAddress } = curve
      const fn = networks[chainId as ChainId].api.loanDeleverage.detailInfo
      const fDetailInfo = await fn(activeKey, llamma, collateral, signerAddress, maxSlippage, userState)
      get()[sliceKey].setStateByKey('detailInfo', { [fDetailInfo.activeKey]: { ...fDetailInfo.resp } })
      return fDetailInfo.resp
    },
    setFormValues: async (llammaId, curve, llamma, updatedFormValues, maxSlippage, isFullReset) => {
      // stored values
      const storedActiveKey = get()[sliceKey].activeKey
      const storedFormEstGas = get()[sliceKey].formEstGas[storedActiveKey] ?? DEFAULT_FORM_EST_GAS
      const storedDetailInfo = get()[sliceKey].detailInfo[storedActiveKey] ?? DEFAULT_DETAIL_INFO
      const storedFormValues = get()[sliceKey].formValues
      const storedUserDetails = get().loans.userDetailsMapper[llammaId]

      // set formValues, reset status
      const cFormValues: FormValues = cloneDeep({
        ...storedFormValues,
        ...updatedFormValues,
        collateralError: '',
      })
      const activeKey = getActiveKey(llammaId, cFormValues, maxSlippage)
      const cFormStatus = cloneDeep(DEFAULT_FORM_STATUS)
      get()[sliceKey].setStateByKeys({
        activeKey,
        formValues: cloneDeep(cFormValues),
        formStatus: cloneDeep(cFormStatus),
        ...(+cFormValues.collateral > 0 && !isFullReset
          ? { detailInfo: { [activeKey]: cloneDeep({ ...storedDetailInfo, loading: true }) } }
          : {}),
      })

      if (!curve || !llamma || !storedUserDetails || (curve && !curve.signerAddress)) return

      const chainId = curve.chainId as ChainId
      const { userState, userStatus } = storedUserDetails
      const isSoftLiquidation = userStatus?.colorKey === 'soft_liquidation'

      // fetch details
      const fDetailInfo = await get()[sliceKey].fetchDetailInfo(
        activeKey,
        curve,
        llamma,
        cFormValues,
        maxSlippage,
        userState,
      )

      if (fDetailInfo.error) {
        cFormStatus.error = fDetailInfo.error
        get()[sliceKey].setStateByKey('formStatus', { [activeKey]: cloneDeep(cFormStatus) })
      } else if (+cFormValues.collateral > 0) {
        cFormValues.isFullRepay = fDetailInfo.isFullRepayment

        // validate
        if (fDetailInfo.isAvailable && isSoftLiquidation && !cFormValues.isFullRepay) {
          cFormStatus.error = 'error-full-repayment-required'
          fDetailInfo.healthFull = ''
          fDetailInfo.healthNotFull = ''
          fDetailInfo.prices = []
          get()[sliceKey].setStateByKey('detailInfo', { [activeKey]: { ...fDetailInfo } })
        }
        if (+cFormValues.collateral > +userState.collateral) {
          cFormValues.collateralError = 'too-much'
        }
        get()[sliceKey].setStateByKeys({ formStatus: cloneDeep(cFormStatus), formValues: cloneDeep(cFormValues) })

        //   fetch est gas
        if (!cFormValues.collateralError && cFormStatus.error !== 'error-full-repayment-required') {
          // fetch est gas
          const clonedStoredFormEstGas = cloneDeep(storedFormEstGas)
          clonedStoredFormEstGas.loading = true
          get()[sliceKey].setStateByKey('formEstGas', { [activeKey]: clonedStoredFormEstGas })
          void get()[sliceKey].fetchEstGas(activeKey, chainId, llamma, cFormValues, maxSlippage)
        }
      }
    },

    // steps
    fetchEstGas: async (activeKey, chainId, llamma, formValues, maxSlippage) => {
      const { collateral } = formValues
      const estGasFn = networks[chainId].api.loanDeleverage.estGas
      const resp = await estGasFn(activeKey, llamma, collateral, maxSlippage)
      get()[sliceKey].setStateByActiveKey('formEstGas', resp.activeKey, { estimatedGas: resp.estimatedGas })

      // update formStatus
      const clonedFormStatus = cloneDeep(get()[sliceKey].formStatus)
      clonedFormStatus.error = resp.error || clonedFormStatus.error || ''
      get()[sliceKey].setStateByKey('formStatus', clonedFormStatus)
    },
    fetchStepRepay: async (activeKey, curve, llamma, formValues, maxSlippage) => {
      const { provider, wallet } = useWallet.getState()
      if (!provider || !wallet) return setMissingProvider(get()[sliceKey])

      get()[sliceKey].setStateByKey('formStatus', {
        ...get()[sliceKey].formStatus,
        isInProgress: true,
        step: 'REPAY',
      })
      const chainId = curve.chainId as ChainId
      const repayFn = networks[chainId].api.loanDeleverage.repay
      const resp = await repayFn(activeKey, provider, llamma, formValues.collateral, maxSlippage)
      updateUserEventsApi(wallet, networks[chainId], llamma, resp.hash)

      if (resp.activeKey === get()[sliceKey].activeKey) {
        let loanExists = true
        const cFormStatus = cloneDeep(DEFAULT_FORM_STATUS)
        cFormStatus.isApproved = get()[sliceKey].formStatus.isApproved

        if (resp.error) {
          get()[sliceKey].setStateByKey('formStatus', cloneDeep({ ...cFormStatus, error: resp.error }))
        } else {
          // re-fetch loan info
          const respLoanDetails = await get().loans.fetchLoanDetails(curve, llamma)
          loanExists = respLoanDetails.loanExists

          if (!loanExists) {
            get().loans.resetUserDetailsState(llamma)
          }

          await invalidateAllUserMarketDetails({
            chainId,
            marketId: llamma.id,
            userAddress: wallet?.address,
          })

          get()[sliceKey].setStateByKeys({
            formValues: DEFAULT_FORM_VALUES,
            formStatus: cloneDeep({ ...cFormStatus, isComplete: true }),
            detailInfo: {},
            formEstGas: {},
          })
        }

        return { ...resp, loanExists }
      }
    },

    // slice helpers
    setStateByActiveKey: (key, activeKey, value) => {
      get().setAppStateByActiveKey(sliceKey, key, activeKey, value)
    },
    setStateByKey: (key, value) => {
      get().setAppStateByKey(sliceKey, key, value)
    },
    setStateByKeys: (sliceState) => {
      get().setAppStateByKeys(sliceKey, sliceState)
    },
    resetState: () => {
      get().resetAppState(sliceKey, cloneDeep(DEFAULT_STATE))
    },
  },
})

function getActiveKey(llammaId: string, { collateral, isFullRepay }: FormValues, maxSlippage: string) {
  return `${llammaId}-collateral-${collateral}-${isFullRepay}-${maxSlippage}`
}
