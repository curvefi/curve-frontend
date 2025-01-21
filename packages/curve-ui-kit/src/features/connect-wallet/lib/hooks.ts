import { useCallback } from 'react'
import { useConnectWallet as useOnboardWallet } from '@web3-onboard/react'
import { useWalletStore } from '../store'

export { useSetChain, useSetLocale } from '@web3-onboard/react'

export const useConnectWallet = () => {
  const [{ wallet, connecting }, connect, disconnect] = useOnboardWallet()
  const chooseWallet = useWalletStore((s) => s.chooseWallet)
  const onConnect: typeof connect = useCallback(
    async (options) => {
      const wallets = await connect(options)
      chooseWallet(wallets[0])
      return wallets
    },
    [chooseWallet, connect],
  )
  const onDisconnect: typeof disconnect = useCallback(
    async (options) => {
      const wallets = await disconnect(options)
      chooseWallet(wallets[0])
      return wallets
    },
    [disconnect, chooseWallet],
  )

  return [{ wallet, connecting }, onConnect, onDisconnect] as const
}
