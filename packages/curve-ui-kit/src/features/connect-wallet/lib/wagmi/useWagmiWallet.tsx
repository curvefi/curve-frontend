import { Eip1193Provider } from 'ethers'
import { useCallback } from 'react'
import { useClient } from 'wagmi'
import { Connectors } from '@ui-kit/features/connect-wallet/lib/wagmi/connectors'
import { SupportedWallets } from '@ui-kit/features/connect-wallet/lib/wagmi/wallets'
import { useGlobalStorage } from '@ui-kit/hooks/useGlobalStorage'
import { connect, disconnect } from '@wagmi/core'
import type { Wallet } from '../types'
import { clientToProvider } from './adapter'
import { config } from './wagmi-config'

export const useIsWalletConnecting = () => useGlobalStorage<boolean>('isWalletConnecting', false)
export const useWalletStorage = () => useGlobalStorage<Wallet, null>('wagmiWallet', null)
export const useConnectPromise = () =>
  useGlobalStorage<[resolve: (wallet: Wallet) => void, reject: (err: unknown) => void], null>(
    'wagmiConnectWallet',
    null,
  )

export const useWagmiWallet = () => {
  const [connecting, setConnecting] = useIsWalletConnecting()
  const [wallet, setWallet] = useWalletStorage()
  const [connectPromise, setConnectPromise] = useConnectPromise()
  const client = useClient<typeof config>() as any

  const connectWagmi = useCallback(
    async (label?: string): Promise<Wallet | null> => {
      const connectorType = label && SupportedWallets.find((w) => w.label === label)?.connector
      if (!connectorType) {
        // console.log(new Date().toISOString(), 'open modal', { label, clientAccount: client.account })
        return new Promise<Wallet | null>((...args) => setConnectPromise(args))
      }

      // console.log(new Date().toISOString(), 'connecting via wagmi', { label, connectorType })

      setConnecting(true)
      try {
        const { accounts, chainId } = await connect(config, { connector: Connectors[connectorType] })
        // console.log(new Date().toISOString(), 'connected', { accounts, chainId })
        const provider = clientToProvider(client)
        const wallet: Wallet = {
          label,
          account: { address: accounts[0], ensName: undefined }, // todo: get ENS name
          chainId,
          provider: {
            request(request: { method: string; params?: Array<any> | Record<string, any> }): Promise<any> {
              return provider.send(request.method, request.params ?? [])
            },
          } satisfies Eip1193Provider,
        } satisfies Wallet
        setWallet(wallet)
        setConnectPromise((promise) => {
          const [resolve] = promise || []
          resolve?.(wallet)
          return null
        })
        return wallet
      } catch (e) {
        setConnectPromise((promise) => {
          const [, reject] = promise || []
          reject?.(e)
          return null
        })
        throw e
      } finally {
        setConnecting(false)
      }
    },
    [client, setConnecting, setConnectPromise, setWallet],
  )

  const disconnectWagmi = useCallback(
    () =>
      // console.log(new Date().toISOString(), 'disconnecting wagmi')
      disconnect(config),
    [],
  )

  const onModalClose = useCallback(() => setConnectPromise(null), [setConnectPromise])

  return [
    { wallet, connecting, isModalOpen: !!connectPromise, client },
    connectWagmi,
    disconnectWagmi,
    onModalClose,
  ] as const
}
