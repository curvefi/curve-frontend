import { BrowserProvider } from 'ethers'
import { Dispatch, SetStateAction, useMemo } from 'react'
import { initOnboard } from '@ui-kit/features/connect-wallet/lib/init'
import { useBetaFlag, useWalletName } from '@ui-kit/hooks/useLocalStorage'
import { Address } from '@ui-kit/utils'
import { useConnectWallet as useOnboardWallet } from '@web3-onboard/react'
import type { Wallet } from './types'
import { convertOnboardWallet } from './utils/wallet-helpers'
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
  initialize(...params: Parameters<typeof initOnboard>): void
}

const state: {
  provider: BrowserProvider | null
  wallet: Wallet | null
} = {
  provider: null,
  wallet: null,
}

/**
 * Hook to determine if the Wagmi wallet should be used.
 * @returns {boolean} - True if Wagmi wallet should be used, false if Onboard wallet should be used.
 **/
export const useUseWagmi = (): boolean => {
  const [isBeta] = useBetaFlag()
  const [{ wallet, connecting }] = useOnboardWallet()
  return isBeta && !wallet && !connecting
}

export const useWallet: UseConnectWallet = () => {
  const [{ wallet: onboardWallet, connecting: onboardConnecting }, onboardConnect, onboardDisconnect] =
    useOnboardWallet()
  const [{ wallet: wagmiWallet, connecting: wagmiConnecting }, wagmiConnect, wagmiDisconnect] = useWagmi()
  const [walletName, setWalletName] = useWalletName()
  const shouldUseWagmi = useUseWagmi()

  const { wallet, provider } = useMemo(() => {
    state.wallet = shouldUseWagmi ? wagmiWallet : onboardWallet && convertOnboardWallet(onboardWallet)
    state.provider = state.wallet?.provider ? new BrowserProvider(state.wallet.provider) : null
    return state
  }, [onboardWallet, wagmiWallet, shouldUseWagmi])

  const signerAddress = onboardWallet?.accounts[0]?.address ?? wagmiWallet?.account?.address
  const connect = useMemo(
    (): ((label?: string) => Promise<Wallet | null>) =>
      shouldUseWagmi
        ? wagmiConnect
        : async (label?: string) => {
            const [wallet] = await onboardConnect({ ...(label && { autoSelect: { label, disableModals: true } }) })
            return convertOnboardWallet(wallet)
          },
    [onboardConnect, shouldUseWagmi, wagmiConnect],
  )

  const disconnect = useMemo(
    () =>
      shouldUseWagmi
        ? wagmiDisconnect
        : async () => wallet?.label && (await onboardDisconnect({ label: wallet.label })),
    [onboardDisconnect, shouldUseWagmi, wagmiDisconnect, wallet],
  )

  return {
    wallet: wallet,
    connecting: wagmiConnecting || onboardConnecting,
    connect,
    disconnect,
    walletName,
    setWalletName,
    provider,
    signerAddress,
  }
}
useWallet.initialize = (...params) => initOnboard(...params)
useWallet.getState = () => ({ wallet: state.wallet, provider: state.provider })
