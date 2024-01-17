import type { CustomNotification, NotificationType } from '@web3-onboard/core/dist/types'
import type { GetState, SetState } from 'zustand'
import type { OnboardAPI, UpdateNotification } from '@web3-onboard/core'
import type { State } from '@/store/useStore'

import { ethers } from 'ethers'
import { log, setStorageValue } from '@/utils'
import produce from 'immer'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  isConnectWallet: boolean
  isDisconnectWallet: boolean
  isNetworkChangedFromApp: boolean
  isNetworkMismatched: boolean
  isSwitchNetwork: boolean
  loaded: boolean
  notSupportedNetworkChain: boolean
  onboard: OnboardAPI | null
  provider: Provider | null
}

const sliceKey = 'wallet'

// prettier-ignore
export type WalletSlice = {
  [sliceKey]: SliceState & {
    notifyNotification(message: string, type: NotificationType, autoDismiss?: number): ({ dismiss: () => void; update: UpdateNotification | undefined })
    updateConnectWalletStateKeys(): void
    updateWallet(chainId: ChainId, wallet: Wallet | null): void
    getProvider(sliceKey: 'quickSwap' | 'poolDeposit' | 'poolWithdraw' | 'poolSwap' | 'dashboard' | 'lockedCrv'): Provider

    updateWalletStoreByKey: <T>(key: StateKey, value: T) => void
    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  isConnectWallet: false,
  isDisconnectWallet: false,
  isNetworkChangedFromApp: false,
  isNetworkMismatched: false,
  isSwitchNetwork: false,
  loaded: false,
  notSupportedNetworkChain: false,
  onboard: null,
  provider: null,
}

const createWalletSlice = (set: SetState<State>, get: GetState<State>): WalletSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,
    notifyNotification: (message, type = 'pending', autoDismiss) => {
      const onboard = get().wallet.onboard

      if (onboard) {
        // see https://onboard.blocknative.com/docs/packages/core#options for all options
        const customNotification: CustomNotification = {
          type,
          message,
        }

        if (typeof autoDismiss !== 'undefined') {
          customNotification.autoDismiss = autoDismiss
        }

        return onboard.state.actions.customNotification(customNotification)
      } else {
        return { dismiss: () => {}, update: undefined }
      }
    },
    updateConnectWalletStateKeys: () => {
      get().wallet.updateWalletStoreByKey('isConnectWallet', true)
      get().wallet.updateWalletStoreByKey('isNetworkChangedFromApp', true)
    },
    updateWallet: (chainId, wallet) => {
      log('updateWallet', chainId, { wallet })
      let updatedProvider: Provider | null = null
      let appCache = { walletName: '' }

      if (wallet?.provider) {
        updatedProvider = getProvider(wallet)
        appCache.walletName = wallet.label
      }

      set(
        produce((state: State) => {
          state.wallet.provider = updatedProvider
          state.wallet.isConnectWallet = false
          state.wallet.isNetworkChangedFromApp = false
          state.wallet.isSwitchNetwork = false
        })
      )
      setStorageValue('APP_CACHE', appCache)
    },
    getProvider: (sliceKey) => {
      const provider = get().wallet.provider
      if (provider) {
        return provider
      } else {
        get()[sliceKey].setStateByKey('formStatus', {
          ...get()[sliceKey].formStatus,
          step: '',
          formProcessing: false,
          error: 'error-invalid-provider',
        })
      }
    },

    // slice helpers
    updateWalletStoreByKey: (key, value) => {
      set(
        produce((state) => {
          state.wallet[key] = value
        })
      )
    },
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
      set(
        produce((state: State) => {
          state.wallet = {
            ...state.wallet,
            ...DEFAULT_STATE,
          }
        })
      )
    },
  },
})

export default createWalletSlice

export function getProvider(wallet: Wallet) {
  if ('isExodus' in wallet.provider) {
    return wallet.provider
  } else {
    return new ethers.BrowserProvider(wallet.provider, 'any')
  }
}

export function getWalletChainId(wallet: Wallet) {
  const chainId = wallet.chains[0].id
  return +BigInt(chainId).toString()
}
