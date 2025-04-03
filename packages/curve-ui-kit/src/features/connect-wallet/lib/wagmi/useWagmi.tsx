import { useCallback, useMemo } from 'react'
import { useAccount, useClient, useConnect, useDisconnect, useEnsName } from 'wagmi'
import { useGlobalState } from '@ui-kit/hooks/useGlobalState'
import type { Wallet } from '../types'
import { createWallet } from './adapter'
import { connectors } from './connectors'
import { supportedWallets, type WalletType } from './wallets'

export const useWalletType = () => useGlobalState<WalletType, null>('wallet', null)
export const useConnectPromise = () =>
  useGlobalState<[resolve: (wallet: Wallet) => void, reject: (err: unknown) => void], null>('wagmiConnectWallet', null)

export const useWagmi = () => {
  // when the modal is displayed, we save a promise to resolve later - this is for compatibility with existing code
  const [connecting, setConnecting] = useConnectPromise()

  // this is the wallet type selected in the modal
  const [walletType, setWalletType] = useWalletType()

  // important: use the async functions so we can properly handle the promise failures
  const { connectAsync } = useConnect()
  const { disconnectAsync } = useDisconnect()

  const client = useClient()

  const connectWagmi = useCallback(
    async (label?: string) => {
      const walletType = label && supportedWallets.find((w) => w.label === label)
      if (!walletType) {
        return new Promise<Wallet | null>((...args) => setConnecting(args))
      }
      setWalletType(walletType)
      const [resolve, reject] = connecting ?? []
      try {
        const {
          accounts: [address],
        } = await connectAsync({ connector: connectors[walletType.connector] })
        const { wallet } = createWallet({ client, label, address })
        resolve?.(wallet)
        return wallet
      } catch (err) {
        console.error('Error connecting wallet:', err)
        reject?.(err)
        throw err
      } finally {
        setConnecting(null)
      }
    },
    [client, connectAsync, connecting, setConnecting, setWalletType],
  )

  const closeModal = useCallback(() => setConnecting(null), [setConnecting])

  const { address, isConnecting } = useAccount()
  const { data: ensName } = useEnsName({ address })

  const { wallet } = useMemo(
    () => walletType && address && createWallet({ client, label: walletType.label, address, ensName }),
    [address, client, walletType, ensName],
  ) ?? { wallet: null, provider: null }

  return [{ wallet, connecting: isConnecting || !!connecting }, connectWagmi, disconnectAsync, closeModal] as const
}
