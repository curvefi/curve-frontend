import { BrowserProvider, ethers } from 'ethers'
import { Dispatch, SetStateAction, useCallback, useMemo } from 'react'
import { initOnboard } from '@ui-kit/features/connect-wallet/lib/init'
import { useBetaFlag, useWalletName } from '@ui-kit/hooks/useLocalStorage'
import { Address } from '@ui-kit/utils'
import { switchChain } from '@wagmi/core'
import type { OnboardAPI, UpdateNotification } from '@web3-onboard/core'
import type { NotificationType } from '@web3-onboard/core/dist/types'
import { useConnectWallet as useOnboardWallet, useSetChain as useOnboardSetChain } from '@web3-onboard/react'
import type { Wallet } from './types'
import { convertOnboardWallet, getWalletProvider } from './utils/wallet-helpers'
import { useWagmiWallet } from './wagmi/useWagmiWallet'
import { config, type WagmiChainId } from './wagmi/wagmi-config'

type UseConnectWallet = {
  (): {
    wallet: Wallet | null
    connecting: boolean
    connect: (label?: string) => Promise<Wallet | null>
    disconnect: () => Promise<void>
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

/**
 * Hook to determine if the Wagmi wallet should be used.
 * @returns {boolean} - True if Wagmi wallet should be used, false if Onboard wallet should be used.
 **/
const useUseWagmi = (): boolean => {
  const [isBeta] = useBetaFlag()
  const [{ wallet, connecting }] = useOnboardWallet()
  return isBeta && !wallet && !connecting
}

export const useWallet: UseConnectWallet = () => {
  const [{ wallet: onboardWallet, connecting: onboardConnecting }, onboardConnect, onboardDisconnect] =
    useOnboardWallet()
  const [{ wallet: wagmiWallet, connecting: wagmiConnecting }, wagmiConnect, wagmiDisconnect] = useWagmiWallet()
  const [walletName, setWalletName] = useWalletName()
  const useWagmi = useUseWagmi()

  const { wallet, provider } = useMemo(() => {
    state.wallet = useWagmi ? wagmiWallet : onboardWallet && convertOnboardWallet(onboardWallet)
    state.provider = state.wallet && new BrowserProvider(getWalletProvider(state.wallet))
    return state
  }, [onboardWallet, wagmiWallet, useWagmi])

  const signerAddress = onboardWallet?.accounts[0]?.address
  const connect = useMemo(
    (): ((label?: string) => Promise<Wallet | null>) =>
      useWagmi
        ? wagmiConnect
        : (label?: string) =>
            onboardConnect({ ...(label && { autoSelect: { label, disableModals: true } }) }).then((wallets) =>
              convertOnboardWallet(wallets[0]),
            ),
    [onboardConnect, useWagmi, wagmiConnect],
  )

  const disconnect = useMemo(
    () =>
      useWagmi
        ? wagmiDisconnect
        : async () => {
            wallet && (await onboardDisconnect(wallet))
          },
    [onboardDisconnect, useWagmi, wagmiDisconnect, wallet],
  )

  return {
    wallet: wallet,
    connecting: useWagmi ? wagmiConnecting : onboardConnecting,
    connect,
    disconnect,
    walletName,
    setWalletName,
    provider,
    signerAddress,
  }
}
useWallet.initialize = (...params) => (onboard = initOnboard(...params))
useWallet.getState = () => ({ wallet: state.wallet, provider: state.provider })

export const useSetChain = () => {
  const [_, setOnboardChain] = useOnboardSetChain()
  const useWagmi = useUseWagmi()
  return useCallback(
    async (chainId: number): Promise<boolean> => {
      if (!useWagmi) {
        return setOnboardChain({ chainId: ethers.toQuantity(chainId) })
      }
      try {
        await switchChain(config, { chainId: chainId as WagmiChainId })
        return true
      } catch (error) {
        console.error('Error switching chain:', error)
        return false
      }
    },
    [setOnboardChain, useWagmi],
  )
}

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
