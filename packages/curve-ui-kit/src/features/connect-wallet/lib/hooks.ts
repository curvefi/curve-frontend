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
import type { WagmiChainId } from './wagmi/chains'
import { useWagmi } from './wagmi/useWagmi'
import { config } from './wagmi/wagmi-config'

type UseConnectWallet = {
  (): {
    wallet: Wallet | null
    connecting: boolean
    connect: (label?: string) => Promise<Wallet | null>
    disconnect: () => Promise<unknown>
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
    state.provider = state.wallet && new BrowserProvider(getWalletProvider(state.wallet))
    return state
  }, [onboardWallet, wagmiWallet, shouldUseWagmi])

  const signerAddress = onboardWallet?.accounts[0]?.address
  const connect = useMemo(
    (): ((label?: string) => Promise<Wallet | null>) =>
      shouldUseWagmi
        ? async (label?: string) => await wagmiConnect(label)
        : async (label?: string) => {
            const [wallet] = await onboardConnect({ ...(label && { autoSelect: { label, disableModals: true } }) })
            return convertOnboardWallet(wallet)
          },
    [onboardConnect, shouldUseWagmi, wagmiConnect],
  )

  const disconnect = useMemo(
    () => (shouldUseWagmi ? wagmiDisconnect : async () => wallet && (await onboardDisconnect(wallet))),
    [onboardDisconnect, shouldUseWagmi, wagmiDisconnect, wallet],
  )

  return {
    wallet: wallet,
    connecting: shouldUseWagmi ? wagmiConnecting : onboardConnecting,
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
  const shouldUseWagmi = useUseWagmi()
  return useCallback(
    async (chainId: number): Promise<boolean> => {
      if (!shouldUseWagmi) {
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
    [setOnboardChain, shouldUseWagmi],
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
