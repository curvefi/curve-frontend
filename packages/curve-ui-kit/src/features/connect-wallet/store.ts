import { create, type StateCreator } from 'zustand'
import type { OnboardAPI, UpdateNotification, WalletState as Wallet } from '@web3-onboard/core'
import { BrowserProvider } from 'ethers'
import type { NotificationType } from '@web3-onboard/core/dist/types'
import { initOnboard } from './lib/init'
import { devtools } from 'zustand/middleware'
import { CONNECT_STAGE, ConnectState } from 'ui'

type WalletState = {
  onboard: OnboardAPI | null
  provider: BrowserProvider | null
  wallet: Wallet | null
  connectState: ConnectState
}

type WalletActions = {
  notify(
    message: string,
    type: NotificationType,
    autoDismiss?: number,
  ): {
    dismiss: () => void
    update: UpdateNotification | undefined
  }

  connectWallet(): void
  getProvider(): BrowserProvider | null
  chooseWallet(wallet: Wallet | null): Promise<void>
  initialize(...params: Parameters<typeof initOnboard>): void
}

export type WalletStore = WalletState & WalletActions

const DEFAULT_STATE: WalletState = {
  onboard: null,
  provider: null,
  wallet: null,
  connectState: { status: '', stage: '' },
}

const walletStore: StateCreator<WalletStore> = (set, get): WalletStore => ({
  ...DEFAULT_STATE,
  connectWallet: () =>
    set({
      connectState: {
        status: 'loading',
        stage: CONNECT_STAGE.CONNECT_WALLET,
        options: [''],
      },
    }),
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
  getProvider: () => {
    const { wallet } = get()
    return wallet && new BrowserProvider(wallet.provider)
  },
  chooseWallet: async (wallet: Wallet | null) => {
    const storedProvider = get().provider
    const newProvider = wallet ? getWalletProvider(wallet) : null
    if (storedProvider) await storedProvider.removeAllListeners()
    return set({
      wallet,
      provider: newProvider,
    })
  },
  initialize: (locale, themeType, networks) => {
    if (get().onboard) return console.log('initialize: already initialized', get())
    const onboard = initOnboard(locale, themeType, networks)
    const wallet = get().onboard?.state.get().wallets?.[0]
    const provider = wallet && new BrowserProvider(wallet.provider)
    console.log('initialize', { onboard, wallet, provider, existing: get() })
    return set({ onboard, wallet, provider })
  },
})

export const useWalletStore =
  process.env.NODE_ENV === 'development' ? create(devtools(walletStore)) : create(walletStore)

function getWalletProvider(wallet: Wallet) {
  if ('isTrustWallet' in wallet.provider) {
    // unable to connect to curvejs with wallet.provider
    return window.ethereum
  } else if ('isExodus' in wallet.provider && typeof window.exodus.ethereum !== 'undefined') {
    return window.exodus.ethereum
  }
  return wallet.provider
}
