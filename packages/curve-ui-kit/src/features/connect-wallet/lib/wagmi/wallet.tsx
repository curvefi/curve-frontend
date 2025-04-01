import { Eip1193Provider } from 'ethers'
import { useCallback } from 'react'
import { useClient } from 'wagmi'
import { useIsWalletConnecting, useIsWalletModalOpen, useWalletStorage } from '@ui-kit/hooks/useGlobalStorage'
import { connect, disconnect } from '@wagmi/core'
import type { Wallet } from '../types'
import { clientToProvider } from './adapter'
import { config, Connectors, SupportedWallets } from './setup'

export const useWagmiWallet = () => {
  const [isModalOpen, setIsModalOpen] = useIsWalletModalOpen()
  const [connecting, setConnecting] = useIsWalletConnecting()
  const [wallet, setWallet] = useWalletStorage()
  const client = useClient()

  const connectWagmi = useCallback(
    async (label?: string): Promise<Wallet | null> => {
      const connectorType = label && SupportedWallets.find((w) => w.label === label)?.connector
      if (!connectorType) {
        console.log('set modal', label)
        setIsModalOpen(true)
        return null
      }

      console.log('connect', label, connectorType)

      setConnecting(true)
      try {
        const { accounts, chainId } = await connect(config, { connector: Connectors[connectorType] })
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
        return wallet
      } finally {
        setConnecting(false)
        setWallet(null)
      }
    },
    [client, setConnecting, setIsModalOpen, setWallet],
  )

  const disconnectWagmi = useCallback(() => disconnect(config), [])

  const onModalClose = useCallback(() => {
    setIsModalOpen(false)
    setConnecting(false)
  }, [setIsModalOpen, setConnecting])

  return [{ wallet, connecting, isModalOpen, client }, connectWagmi, disconnectWagmi, onModalClose] as const
}
