import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type { CustomNotification, NotificationType } from '@web3-onboard/core/dist/types'
import type { Provider } from '@/store/types'
import type { OnboardAPI, UpdateNotification } from '@web3-onboard/core'

import { ethers } from 'ethers'

import { log } from '@/utils/helpers'
import { setStorageValue } from '@/utils/storage'
import cloneDeep from 'lodash/cloneDeep'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  isConnectWallet: boolean
  isDisconnectWallet: boolean
  isNetworkChangedFromApp: boolean
  isNetworkMismatched: boolean
  isSwitchNetwork: boolean
  loaded: boolean
  onboard: OnboardAPI | null
  provider: Provider | null
  showProviderDialog: boolean
  showProviderDialogDiscarded: boolean
  signer: null
  wallet: Wallet | null
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

export type WalletSlice = {
  [sliceKey]: SliceState & {
    notifyNotification(
      message: string,
      type: NotificationType,
      autoDismiss?: number
    ): { dismiss: () => void; update?: UpdateNotification }
    getProvider(sliceKey: ProviderSliceKey): ethers.providers.Web3Provider | null
    updateConnectWalletStateKeys(): void
    setWallet(chainId: ChainId, wallet: Wallet | null): void

    // steps helper
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
  onboard: null,
  provider: null,
  showProviderDialog: false,
  showProviderDialogDiscarded: false,
  signer: null,
  wallet: null,
}

const createWalletSlice = (set: SetState<State>, get: GetState<State>) => ({
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
    updateConnectWalletStateKeys: () => {
      get().wallet.setStateByKeys({
        isConnectWallet: true,
        isNetworkChangedFromApp: true,
      })
    },
    setWallet: (chainId: ChainId, wallet: Wallet | null) => {
      log('setWallet', chainId, { wallet })
      let updatedProvider = null

      if (wallet?.provider) {
        if ('isExodus' in wallet.provider) {
          updatedProvider = wallet.provider
        } else {
          updatedProvider = new ethers.providers.Web3Provider(wallet.provider)
        }
      }

      get().wallet.setStateByKeys({
        // @ts-ignore
        provider: updatedProvider,
        wallet: wallet || null,
        signer: null,
        isConnectWallet: false,
        isNetworkChangedFromApp: false,
        isSwitchNetwork: false,
      })

      const appCache = { walletName: wallet ? wallet.label : '' }
      setStorageValue('APP_CACHE', appCache)
    },
    getProvider: (sliceKey: ProviderSliceKey) => {
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
        return null
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

export default createWalletSlice

export function getWalletChainId(wallet: Wallet): number {
  const chainId = (wallet as Wallet).chains[0].id
  return ethers.BigNumber.from(chainId).toNumber()
}
