import { BrowserProvider } from 'ethers'
import { Dispatch, SetStateAction, useEffect } from 'react'
import { initOnboard } from '@ui-kit/features/connect-wallet/lib/init'
import { useLocalStorage } from '@ui-kit/hooks/useLocalStorage'
import { Address } from '@ui-kit/utils'
import type { OnboardAPI, UpdateNotification } from '@web3-onboard/core'
import type {
  ConnectOptions,
  DisconnectOptions,
  NotificationType,
  WalletState as Wallet,
} from '@web3-onboard/core/dist/types'
import { useConnectWallet as useOnboardWallet } from '@web3-onboard/react'
import { getRpcProvider } from './utils/wallet-helpers'

type UseConnectWallet = {
  (): {
    wallet: Wallet | null
    connecting: boolean
    connect: (options?: ConnectOptions) => Promise<Wallet[]>
    disconnect: (wallet: DisconnectOptions) => Promise<Wallet[]>
    walletName: string | null
    setWalletName: Dispatch<SetStateAction<string | null>>
    provider: BrowserProvider | null
    signerAddress: Address | undefined
  }
  getState: () => typeof state
  initialize(...params: Parameters<typeof initOnboard>): void
}

let onboard: OnboardAPI | null = null
const state: {
  provider: BrowserProvider | null
  wallet: Wallet | null
} = {
  provider: null,
  wallet: null,
}

export const useWallet: UseConnectWallet = () => {
  const [{ wallet, connecting }, connect, disconnect] = useOnboardWallet()
  const [walletName, setWalletName] = useLocalStorage<string | null>('walletName')

  useEffect(() => {
    state.wallet = wallet
    state.provider = wallet && new BrowserProvider(getRpcProvider(wallet))
  }, [wallet])

  const signerAddress = wallet?.accounts?.[0]?.address
  return {
    wallet,
    connecting,
    connect,
    disconnect,
    walletName,
    setWalletName,
    provider: useWallet.getState().provider,
    signerAddress,
  }
}
useWallet.initialize = (...params) => (onboard = initOnboard(...params))
useWallet.getState = () => ({ wallet: state.wallet, provider: state.provider })

export const notify = (
  message: string,
  type: NotificationType,
  autoDismiss?: number,
): { dismiss: () => void; update: UpdateNotification | undefined } => {
  if (!onboard) {
    throw new Error('Onboard not initialized')
  }
  return onboard.state.actions.customNotification({
    type,
    message,
    ...(typeof autoDismiss !== 'undefined' && { autoDismiss }),
  })
}
