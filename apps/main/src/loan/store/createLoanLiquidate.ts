import cloneDeep from 'lodash/cloneDeep'
import type { GetState, SetState } from 'zustand'
import type { FormStatus } from '@/loan/components/PageLoanManage/LoanLiquidate/types'
import type { FormEstGas } from '@/loan/components/PageLoanManage/types'
import { DEFAULT_FORM_EST_GAS, DEFAULT_FORM_STATUS as FORM_STATUS } from '@/loan/components/PageLoanManage/utils'
import networks from '@/loan/networks'
import type { State } from '@/loan/store/useStore'
import { ChainId, LlamaApi, Llamma, UserWalletBalances } from '@/loan/types/loan.types'
import { setMissingProvider, useWallet } from '@ui-kit/features/connect-wallet'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  formEstGas: FormEstGas
  formStatus: FormStatus
  liquidationAmt: string
}

const sliceKey = 'loanLiquidate'

export type LoanLiquidateSlice = {
  [sliceKey]: SliceState & {
    fetchEstGasApproval(chainId: ChainId, llamma: Llamma, maxSlippage: string, formStatus: FormStatus): Promise<void>
    fetchTokensToLiquidate(
      chainId: ChainId,
      llamma: Llamma,
      llammaId: string,
      maxSlippage: string,
      userWalletBalances: UserWalletBalances,
    ): Promise<void>

    // step
    fetchStepApprove(
      curve: LlamaApi,
      llamma: Llamma,
      maxSlippage: string,
    ): Promise<{ hashes: string[]; error: string } | undefined>
    fetchStepLiquidate(
      curve: LlamaApi,
      llamma: Llamma,
      liquidationAmt: string,
      maxSlippage: string,
    ): Promise<{ error: string; hash: string; loanExists: boolean } | undefined>

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
  liquidationAmt: '',
}

const createLoanLiquidate = (set: SetState<State>, get: GetState<State>) => ({
  loanLiquidate: {
    ...DEFAULT_STATE,

    fetchEstGasApproval: async (chainId: ChainId, llamma: Llamma, maxSlippage: string, formStatus: FormStatus) => {
      const resp = await networks[chainId].api.loanLiquidate.estGasApproval(llamma, maxSlippage)

      get()[sliceKey].setStateByKey('formEstGas', { estimatedGas: resp.estimatedGas })

      // update formStatus
      const clonedFormStatus = cloneDeep(formStatus)
      clonedFormStatus.isApproved = resp.isApproved
      clonedFormStatus.error = formStatus.error || resp.error
      clonedFormStatus.warning = formStatus.warning || resp.warning
      get()[sliceKey].setStateByKey('formStatus', clonedFormStatus)
    },
    fetchTokensToLiquidate: async (
      chainId: ChainId,
      llamma: Llamma,
      llammaId: string,
      maxSlippage: string,
      userWalletBalances: UserWalletBalances,
    ) => {
      const resp = await networks[chainId].api.loanLiquidate.tokensToLiquidate(chainId, llamma)
      get()[sliceKey].setStateByKey('liquidationAmt', resp.tokensToLiquidate)

      // update formStatus
      const clonedFormStatus = cloneDeep(get()[sliceKey].formStatus)
      clonedFormStatus.error = resp.error
      const canSelfLiquidate = haveEnoughCrvusdForLiquidation(userWalletBalances.stablecoin, resp.tokensToLiquidate)
      clonedFormStatus.warning = !canSelfLiquidate ? 'warning-not-enough-crvusd' : ''

      get()[sliceKey].setStateByKey('formStatus', clonedFormStatus)
      if (canSelfLiquidate) {
        void get()[sliceKey].fetchEstGasApproval(chainId, llamma, maxSlippage, clonedFormStatus)
      }
    },

    // step
    fetchStepApprove: async (curve: LlamaApi, llamma: Llamma, maxSlippage: string) => {
      const { provider } = useWallet.getState()
      if (!provider) return setMissingProvider(get()[sliceKey])

      get()[sliceKey].setStateByKey('formStatus', {
        ...get()[sliceKey].formStatus,
        isInProgress: true,
        step: 'APPROVAL',
      })
      await get().gas.fetchGasInfo(curve)
      const chainId = curve.chainId
      const resp = await networks[chainId].api.loanLiquidate.approve(provider, llamma)
      const updatedFormStatus: FormStatus = {
        ...get()[sliceKey].formStatus,
        isApproved: !resp.error,
        step: '',
        isInProgress: !resp.error,
        error: resp.error,
      }
      get()[sliceKey].setStateByKey('formStatus', updatedFormStatus)
      void get()[sliceKey].fetchEstGasApproval(chainId, llamma, maxSlippage, updatedFormStatus)
      return resp
    },
    fetchStepLiquidate: async (curve: LlamaApi, llamma: Llamma, liquidationAmt: string, maxSlippage: string) => {
      const { provider } = useWallet.getState()
      if (!provider) return setMissingProvider(get()[sliceKey])

      get()[sliceKey].setStateByKey('formStatus', {
        ...get()[sliceKey].formStatus,
        isInProgress: true,
        step: 'LIQUIDATE',
      })
      await get().gas.fetchGasInfo(curve)
      const chainId = curve.chainId
      const liquidateFn = networks[chainId].api.loanLiquidate.liquidate
      const resp = await liquidateFn(provider, llamma, maxSlippage)
      const { loanExists } = await get().loans.fetchLoanDetails(curve, llamma)
      if (!loanExists.loanExists) {
        get().loans.resetUserDetailsState(llamma)
      }
      get()[sliceKey].setStateByKeys({
        formEstGas: DEFAULT_FORM_EST_GAS,
        formStatus: {
          ...get()[sliceKey].formStatus,
          isInProgress: false,
          isComplete: !resp.error,
          step: '',
          error: resp.error,
        },
        liquidationAmt: '',
      })
      return { ...resp, loanExists: loanExists.loanExists }
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

export default createLoanLiquidate

export function haveEnoughCrvusdForLiquidation(walletStablecoin: string, tokensToLiquidate: string) {
  return +(walletStablecoin ?? '0') >= +tokensToLiquidate * 1.0001
}
