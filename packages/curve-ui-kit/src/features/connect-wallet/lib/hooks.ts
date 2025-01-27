import { useEffect } from 'react'
import { useConnectWallet as useOnboardWallet } from '@web3-onboard/react'
import { useWalletStore } from '../store'
import { getFromLocalStorage, useLocalStorage } from '@ui-kit/hooks/useLocalStorage'

export { useSetChain, useSetLocale } from '@web3-onboard/react'

export const useConnectWallet = () => {
  const [{ wallet, connecting }, connect, disconnect] = useOnboardWallet()
  const [storedWalletName, setWalletName] = useLocalStorage('walletName')
  // todo: remove this after a while. It tries to read the walletName from the old cache
  const walletName = storedWalletName || getFromLocalStorage<{ walletName: string }>('curve-app-cache')?.walletName

  const chooseWallet = useWalletStore((s) => s.chooseWallet)
  useEffect(() => {
    chooseWallet(wallet)
  }, [chooseWallet, wallet])

  return { wallet, connecting, connect, disconnect, walletName, setWalletName }
}
