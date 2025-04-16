import { BrowserProvider } from 'ethers'
import { Dispatch, SetStateAction, useMemo } from 'react'
import { useWalletName } from '@ui-kit/hooks/useLocalStorage'
import { Address } from '@ui-kit/utils'
import type { Wallet } from './types'
import { useWagmi } from './wagmi/useWagmi'

type UseConnectWallet = {
  (): {
    wallet: Wallet | null
    connecting: boolean
    connect: (label?: string) => Promise<Wallet | null>
    disconnect: (label?: string) => Promise<unknown>
    walletName: string | null
    setWalletName: Dispatch<SetStateAction<string | null>>
    provider: BrowserProvider | null
    signerAddress: Address | undefined
  }
  getState: () => typeof state
}

const state: {
  provider: BrowserProvider | null
  wallet: Wallet | null
} = {
  provider: null,
  wallet: null,
}

export const useWallet: UseConnectWallet = () => {
  const [{ wallet: wagmiWallet, connecting: wagmiConnecting }, wagmiConnect, wagmiDisconnect] = useWagmi()
  const [walletName, setWalletName] = useWalletName()

  const { wallet, provider } = useMemo(() => {
    state.wallet = wagmiWallet
    state.provider = state.wallet?.provider ? new BrowserProvider(state.wallet.provider) : null
    return state
  }, [wagmiWallet])

  return {
    wallet: wallet,
    connecting: wagmiConnecting,
    connect: wagmiConnect,
    disconnect: wagmiDisconnect,
    walletName,
    setWalletName,
    provider,
    signerAddress: wagmiWallet?.account?.address,
  }
}
useWallet.getState = () => ({ wallet: state.wallet, provider: state.provider })
