import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type { FormEstGas } from '@/components/PageLoanManage/types'
import type { FormStatus } from '@/components/PageLoanManage/LoanSelfLiquidation/types'

import cloneDeep from 'lodash/cloneDeep'
import merge from 'lodash/merge'

import { DEFAULT_FORM_EST_GAS, DEFAULT_FORM_STATUS as FORM_STATUS } from '@/components/PageLoanManage/utils'
import apiLending from '@/lib/apiLending'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  formEstGas: FormEstGas
  formStatus: FormStatus
  futureRates: FutureRates | null
  liquidationAmt: string
}

const sliceKey = 'loanSelfLiquidation'

// prettier-ignore
export type LoanSelfLiquidationSlice = {
  [sliceKey]: SliceState & {
    fetchDetails(api: Api, owmData: OWMData, maxSlippage: string): Promise<void>
    fetchEstGasApproval(api: Api, owmData: OWMData, maxSlippage: string): Promise<void>

    // step
    fetchStepApprove(api: Api, owmData: OWMData, maxSlippage: string): Promise<{ hashes: string[]; error: string } | undefined>
    fetchStepLiquidate(api: Api, owmData: OWMData, liquidationAmt: string, maxSlippage: string): Promise<{ error: string; hash: string; loanExists: boolean } | undefined>

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
  warning: '',
}

const DEFAULT_STATE: SliceState = {
  formEstGas: DEFAULT_FORM_EST_GAS,
  formStatus: DEFAULT_FORM_STATUS,
  futureRates: null,
  liquidationAmt: '',
}

const createLoanSelfLiquidationSlice = (set: SetState<State>, get: GetState<State>): LoanSelfLiquidationSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchDetails: async (api, owmData, maxSlippage) => {
      const { signerAddress } = api

      if (!signerAddress || !api || !owmData || !maxSlippage) return

      const resp = await apiLending.loanSelfLiquidation.detailInfo(api, owmData, maxSlippage)

      let cFormStatus = cloneDeep(get()[sliceKey].formStatus)
      cFormStatus.warning = resp.warning || cFormStatus.warning
      get()[sliceKey].setStateByKeys({
        liquidationAmt: resp.tokensToLiquidate,
        futureRates: resp.futureRates,
        formStatus: cloneDeep(cFormStatus),
      })

      // validation
      const userBalancesResp = await get().user.fetchUserMarketBalances(api, owmData, true)
      const canSelfLiquidate = _haveEnoughCrvusdForLiquidation(userBalancesResp.borrowed, resp.tokensToLiquidate)
      cFormStatus = cloneDeep(get()[sliceKey].formStatus)
      cFormStatus.error = resp.error || cFormStatus.error
      cFormStatus.warning = !canSelfLiquidate ? 'warning-not-enough-crvusd' : cFormStatus.warning
      get()[sliceKey].setStateByKey('formStatus', cFormStatus)

      // api calls
      if (!resp.error || !resp.warning) get()[sliceKey].fetchEstGasApproval(api, owmData, maxSlippage)
    },
    fetchEstGasApproval: async (api, owmData, maxSlippage) => {
      const { signerAddress } = api
      const { warning } = get()[sliceKey].formStatus

      if (!signerAddress || warning) return

      get()[sliceKey].setStateByKey('formEstGas', { ...DEFAULT_FORM_EST_GAS, loading: true })
      await get().gas.fetchGasInfo(api)
      const resp = await apiLending.loanSelfLiquidation.estGasApproval(owmData, maxSlippage)
      get()[sliceKey].setStateByKey('formEstGas', { estimatedGas: resp.estimatedGas })

      // update formStatus
      const cFormStatus = cloneDeep(get()[sliceKey].formStatus)
      cFormStatus.isApproved = resp.isApproved
      cFormStatus.error = resp.error || cFormStatus.error
      get()[sliceKey].setStateByKey('formStatus', cFormStatus)
    },

    // step
    fetchStepApprove: async (api, owmData, maxSlippage) => {
      const provider = get().wallet.getProvider(sliceKey)

      if (!provider) return

      // update formStatus
      const partialFormStatus: Partial<FormStatus> = { isInProgress: true, step: 'APPROVAL' }
      get()[sliceKey].setStateByKey('formStatus', merge(cloneDeep(get()[sliceKey].formStatus), partialFormStatus))

      // api calls
      await get().gas.fetchGasInfo(api)
      const resp = await apiLending.loanSelfLiquidation.approve(provider, owmData)

      if (resp) {
        // update formStatus
        const partialFormStatus: Partial<FormStatus> = {
          error: resp.error,
          isApproved: !resp.error,
          isInProgress: true,
        }
        get()[sliceKey].setStateByKey('formStatus', merge(cloneDeep(FORM_STATUS), partialFormStatus))
        if (!resp.error) get()[sliceKey].fetchEstGasApproval(api, owmData, maxSlippage)
        return resp
      }
    },
    fetchStepLiquidate: async (api, owmData, liquidationAmt, maxSlippage) => {
      const provider = get().wallet.getProvider(sliceKey)

      if (!provider) return

      // update formStatus
      const partialFormStatus: Partial<FormStatus> = { isInProgress: true, step: 'SELF_LIQUIDATE' }
      get()[sliceKey].setStateByKey('formStatus', merge(cloneDeep(get()[sliceKey].formStatus), partialFormStatus))

      // api calls
      await get().gas.fetchGasInfo(api)
      const resp = await apiLending.loanSelfLiquidation.selfLiquidate(provider, owmData, maxSlippage)

      if (resp) {
        // api calls
        const loanExists = (await get().user.fetchUserLoanExists(api, owmData, true))?.loanExists
        if (loanExists) get().user.fetchAll(api, owmData, true)
        get().markets.fetchAll(api, owmData, true)

        // update state
        const partialFormStatus: Partial<FormStatus> = {
          error: resp.error,
          isApproved: true,
          isComplete: !resp.error,
        }
        get()[sliceKey].setStateByKeys(merge(cloneDeep(DEFAULT_STATE), { formStatus: partialFormStatus }))
        return { ...resp, loanExists }
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

export default createLoanSelfLiquidationSlice

export function _haveEnoughCrvusdForLiquidation(walletStablecoin: string, tokensToLiquidate: string) {
  return +(walletStablecoin ?? '0') >= +tokensToLiquidate * 1.0001
}
