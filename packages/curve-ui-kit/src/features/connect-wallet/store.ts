import { create, type StateCreator } from 'zustand'
import type { OnboardAPI, UpdateNotification, WalletState as Wallet } from '@web3-onboard/core'
import { BrowserProvider } from 'ethers'
import type { NotificationType } from '@web3-onboard/core/dist/types'
import { initOnboard } from './lib/init'
import { devtools } from 'zustand/middleware'
import type { Address } from 'abitype'
import type { EIP1193Provider } from '@web3-onboard/common'
import { logInfo } from '@ui-kit/lib'

type WalletState = {
  onboard: OnboardAPI | null
  provider: BrowserProvider | null
  cleanup: (() => Promise<void>) | null // removes listeners from provider
  wallet: Wallet | null
}

type WalletActions = {
  /**
   * Sends a message via the onboard notification system.
   * Note: This should be migrated to mui.
   */
  notify(
    message: string,
    type: NotificationType,
    autoDismiss?: number,
  ): {
    dismiss: () => void
    update: UpdateNotification | undefined
  }
  /**
   * Set a new wallet as current, listening for account changes
   */
  chooseWallet(wallet: Wallet | null): Promise<void>
  /**
   * Initialize the onboard instance
   */
  initialize(...params: Parameters<typeof initOnboard>): void
}

export type WalletStore = WalletState & WalletActions

const DEFAULT_STATE: WalletState = {
  onboard: null,
  provider: null,
  cleanup: null,
  wallet: null,
}

const walletStore: StateCreator<WalletStore> = (set, get): WalletStore => ({
  ...DEFAULT_STATE,
  notify: (message, type = 'pending', autoDismiss) => {
    const { onboard } = get()
    if (!onboard) {
      throw new Error('Onboard not initialized')
    }
    return onboard.state.actions.customNotification({
      type,
      message,
      ...(typeof autoDismiss !== 'undefined' && { autoDismiss }),
    })
  },
  chooseWallet: async (wallet: Wallet | null) => {
    const { cleanup, chooseWallet, wallet: oldWallet } = get()
    if (oldWallet === wallet) return // avoid double calls when updated via the useConnectWallet hook
    cleanup?.()
    return set(createProvider(wallet, chooseWallet))
  },
  initialize: async (locale, themeType, networks) => {
    const { chooseWallet } = get()
    const onboard = initOnboard(locale, themeType, networks)
    const wallet = onboard.state.get().wallets?.[0]
    return set({ onboard, ...createProvider(wallet, chooseWallet) })
  },
})

export const useWalletStore =
  process.env.NODE_ENV === 'development' ? create(devtools(walletStore)) : create(walletStore)

function getRpcProvider(wallet: Wallet): EIP1193Provider {
  if ('isTrustWallet' in wallet.provider && window.ethereum) {
    // unable to connect to curvejs with wallet.provider
    return window.ethereum as any // todo: why do we need any here?
  }
  if ('isExodus' in wallet.provider && typeof window.exodus.ethereum !== 'undefined') {
    return window.exodus.ethereum
  }
  return wallet.provider
}

function createProvider(wallet: Wallet | null | undefined, chooseWallet: (wallet: Wallet | null) => Promise<void>) {
  if (!wallet) return { rpcProvider: null, wallet: null, provider: null }
  const rpcProvider = getRpcProvider(wallet)
  const handler = (newAccounts: Address[]) => {
    logInfo('accountsChanged', newAccounts)
    return chooseWallet(newAccounts.length === 0 ? null : wallet)
  }
  rpcProvider.on('accountsChanged', handler)
  const provider = new BrowserProvider(wallet.provider)
  const cleanup = async () => {
    rpcProvider.removeListener('accountsChanged', handler)
    await provider?.removeAllListeners()
  }
  return { cleanup, wallet, provider }
}
