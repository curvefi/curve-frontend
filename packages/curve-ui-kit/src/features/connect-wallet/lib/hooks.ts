import { BrowserProvider, FallbackProvider, JsonRpcProvider } from 'ethers'
import { Dispatch, type ReactNode, SetStateAction, useEffect } from 'react'
import { initOnboard } from '@ui-kit/features/connect-wallet/lib/init'
import { clientToProvider } from '@ui-kit/features/connect-wallet/lib/wagmi/adapter'
import { useBetaFlag } from '@ui-kit/hooks/useBetaFlag'
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
import { useWagmiWallet } from './wagmi/wallet'

type EthersProvider = BrowserProvider | FallbackProvider | JsonRpcProvider

type UseConnectWallet = {
  (): {
    wallet: Wallet | null
    connecting: boolean
    connect: (options?: ConnectOptions) => Promise<Wallet[]>
    disconnect: (wallet: DisconnectOptions) => Promise<Wallet[]>
    walletName: string | null
    setWalletName: Dispatch<SetStateAction<string | null>>
    provider: EthersProvider | null
    signerAddress: Address | undefined
    modal: ReactNode
  }
  getState: () => typeof state
  initialize(...params: Parameters<typeof initOnboard>): void
}

let onboard: OnboardAPI | null = null
const state: {
  provider: EthersProvider | null
  wallet: Wallet | null
} = {
  provider: null,
  wallet: null,
}

export const useWallet: UseConnectWallet = () => {
  const [isBeta] = useBetaFlag()
  const [{ wallet: onboardWallet, connecting: onboardConnecting }, onboardConnect, onboardDisconnect] = useOnboardWallet()
  const [{ wallet: wagmiWallet, connecting: wagmiConnecting, modal }, wagmiConnect, wagmiDisconnect] = useWagmiWallet()
  const [walletName, setWalletName] = useLocalStorage<string | null>('walletName')

  const useWagmi = isBeta && !onboardWallet && !onboardConnecting

  useEffect(() => {
    state.wallet = useWagmi ? wagmiWallet : onboardWallet
    state.provider = useWagmi ? clientToProvider(wagmiWallet.client) : onboardWallet && new BrowserProvider(getRpcProvider(onboardWallet))
  }, [onboardWallet, useWagmi, wagmiWallet])

  const signerAddress = onboardWallet?.accounts?.[0]?.address
  return {
    wallet: useWagmi  ? wagmiWallet : onboardWallet,
    connecting: useWagmi  ? wagmiConnecting : onboardConnecting,
    connect: useWagmi  ? wagmiConnect : onboardConnect,
    disconnect: useWagmi  ? wagmiDisconnect : onboardDisconnect,
    walletName,
    setWalletName,
    provider: state.provider,
    signerAddress,
    modal,
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
