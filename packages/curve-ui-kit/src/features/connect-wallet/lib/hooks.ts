import { useCallback } from 'react'
import { useConnectWallet as useOnboardWallet } from '@web3-onboard/react'
import { useWalletStore } from '../store'
import { getFromLocalStorage, useLocalStorage } from '@ui-kit/hooks/useLocalStorage'

export { useSetChain, useSetLocale } from '@web3-onboard/react'

export const useConnectWallet = () => {
  const [{ wallet, connecting }, connectWallet, disconnectWallet] = useOnboardWallet()
  const [storedWalletName, setWalletName] = useLocalStorage('walletName')
  // todo: remove this after a while. It tries to read the walletName from the old cache
  const walletName = storedWalletName || getFromLocalStorage<{ walletName: string }>('curve-app-cache')?.walletName

  const chooseWallet = useWalletStore((s) => s.chooseWallet)
  const connect: typeof connectWallet = useCallback(
    async (options) => {
      const wallets = await connectWallet(options)
      chooseWallet(wallets[0])
      return wallets
    },
    [chooseWallet, connectWallet],
  )
  const disconnect: typeof disconnectWallet = useCallback(
    async (options) => {
      const wallets = await disconnectWallet(options)
      chooseWallet(wallets[0])
      return wallets
    },
    [disconnectWallet, chooseWallet],
  )

  return { wallet, connecting, connect, disconnect, walletName, setWalletName }
}
