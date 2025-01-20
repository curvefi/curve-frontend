import type { GetState, SetState } from 'zustand'
import type { State } from '@loan/store/useStore'
import type { CustomNotification, NotificationType } from '@web3-onboard/core/dist/types'
import type { Provider } from '@loan/store/types'
import type { OnboardAPI, UpdateNotification } from '@web3-onboard/core'
import cloneDeep from 'lodash/cloneDeep'
import { BrowserProvider } from 'ethers'
import { Wallet } from '@loan/types/loan.types'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  onboard: OnboardAPI | null
  provider: Provider | null
}

type ProviderSliceKey =
  | 'loanCollateralDecrease'
  | 'loanCollateralIncrease'
  | 'loanCreate'
  | 'loanDecrease'
  | 'loanIncrease'
  | 'loanLiquidate'
  | 'loanSwap'
  | 'loanDeleverage'

const sliceKey = 'wallet'

// prettier-ignore
export type WalletSlice = {
  [sliceKey]: SliceState & {
    notifyNotification(message: string, type: NotificationType, autoDismiss?: number): { dismiss: () => void; update?: UpdateNotification }
    updateProvider(wallet: Wallet | null): Promise<void>
    getProvider(sliceKey: string): Provider | null

    // steps helper
    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  onboard: null,
  provider: null,
}

const createWalletSlice = (set: SetState<State>, get: GetState<State>): WalletSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    notifyNotification: (message: string, type: NotificationType = 'pending', autoDismiss?: number) => {
      const onboard = get().wallet.onboard

      if (onboard) {
        // see https://onboard.blocknative.com/docs/packages/core#options for all options
        const customNotification: CustomNotification = { type, message }

        if (typeof autoDismiss !== 'undefined') {
          customNotification.autoDismiss = autoDismiss
        }

        return onboard.state.actions.customNotification(customNotification)
      }
      return { dismiss: () => {} }
    },
    updateProvider: async (wallet) => {
      try {
        const storedProvider = get().wallet.provider
        const newProvider = wallet ? getProvider(wallet) : null
        if (storedProvider) await storedProvider.removeAllListeners()
        get().wallet.setStateByKey('provider', newProvider)
      } catch (error) {
        console.error(error)
      }
    },
    getProvider: (sliceKey: ProviderSliceKey) => {
      const provider = get().wallet.provider
      if (!provider) {
        const storedFormStatus = get()[sliceKey]?.formStatus
        if (
          storedFormStatus &&
          typeof storedFormStatus === 'object' &&
          'step' in storedFormStatus &&
          'formProcessing' in storedFormStatus &&
          'error' in storedFormStatus
        ) {
          get()[sliceKey].setStateByKey('formStatus', {
            ...storedFormStatus,
            step: '',
            formProcessing: false,
            error: 'error-invalid-provider',
          })
        }
      }
      return provider
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

export default createWalletSlice

export function getProvider(wallet: Wallet) {
  return new BrowserProvider(wallet.provider)
}

export function getWalletChainId(wallet: Wallet | undefined | null) {
  if (!wallet) return null
  return +(wallet as Wallet).chains[0].id
}
