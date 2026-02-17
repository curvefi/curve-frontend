import lodash from 'lodash'
import { StoreApi } from 'zustand'
import { updateUserEventsApi } from '@/llamalend/llama.utils'
import { invalidateAllUserMarketDetails } from '@/llamalend/queries/validation/invalidation'
import type { FormStatus } from '@/loan/components/PageMintMarket/LoanLiquidate/types'
import type { FormEstGas } from '@/loan/components/PageMintMarket/types'
import { DEFAULT_FORM_EST_GAS, DEFAULT_FORM_STATUS as FORM_STATUS } from '@/loan/components/PageMintMarket/utils'
import { networks } from '@/loan/networks'
import type { State } from '@/loan/store/useStore'
import { ChainId, LlamaApi, Llamma, UserWalletBalances } from '@/loan/types/loan.types'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { setMissingProvider } from '@ui-kit/utils/store.util'

type StateKey = keyof typeof DEFAULT_STATE
const { cloneDeep } = lodash

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

export const createLoanLiquidate = (_set: StoreApi<State>['setState'], get: StoreApi<State>['getState']) => ({
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
      _llammaId: string,
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
      const chainId = curve.chainId as ChainId
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
    fetchStepLiquidate: async (curve: LlamaApi, llamma: Llamma, _liquidationAmt: string, maxSlippage: string) => {
      const { provider, wallet } = useWallet.getState()
      if (!provider || !wallet) return setMissingProvider(get()[sliceKey])

      get()[sliceKey].setStateByKey('formStatus', {
        ...get()[sliceKey].formStatus,
        isInProgress: true,
        step: 'LIQUIDATE',
      })
      const chainId = curve.chainId as ChainId
      const liquidateFn = networks[chainId].api.loanLiquidate.liquidate
      const resp = await liquidateFn(provider, llamma, maxSlippage)
      updateUserEventsApi(wallet, networks[chainId], llamma, resp.hash)
      const { loanExists } = await get().loans.fetchLoanDetails(curve, llamma)
      if (!loanExists) {
        get().loans.resetUserDetailsState(llamma)
      }
      await invalidateAllUserMarketDetails({
        chainId,
        marketId: llamma.id,
        userAddress: wallet?.address,
      })

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
      return { ...resp, loanExists }
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

export function haveEnoughCrvusdForLiquidation(walletStablecoin: string, tokensToLiquidate: string) {
  return +(walletStablecoin ?? '0') >= +tokensToLiquidate * 1.0001
}
