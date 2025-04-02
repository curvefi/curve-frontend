import { Eip1193Provider } from 'ethers'
import { useCallback } from 'react'
import { useClient } from 'wagmi'
import { Connectors } from '@ui-kit/features/connect-wallet/lib/wagmi/connectors'
import { SupportedWallets } from '@ui-kit/features/connect-wallet/lib/wagmi/wallets'
import { useIsWalletConnecting, useIsWalletModalOpen, useWalletStorage } from '@ui-kit/hooks/useGlobalStorage'
import { connect, disconnect } from '@wagmi/core'
import type { Wallet } from '../types'
import { clientToProvider } from './adapter'
import { config } from './wagmi-config'

export const useWagmiWallet = () => {
  const [isModalOpen, setIsModalOpen] = useIsWalletModalOpen()
  const [connecting, setConnecting] = useIsWalletConnecting()
  const [wallet, setWallet] = useWalletStorage()
  const client = useClient<typeof config>() as any

  const connectWagmi = useCallback(
    async (label?: string): Promise<Wallet | null> => {
      const connectorType = label && SupportedWallets.find((w) => w.label === label)?.connector
      if (!connectorType) {
        setIsModalOpen(true)
        return null
      }

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
        setIsModalOpen(false)
        return wallet
      } finally {
        setConnecting(false)
      }
    },
    [client, setConnecting, setIsModalOpen, setWallet],
  )

  const disconnectWagmi = useCallback(() => disconnect(config), [])

  const onModalClose = useCallback(() => setIsModalOpen(false), [setIsModalOpen])

  return [{ wallet, connecting, isModalOpen, client }, connectWagmi, disconnectWagmi, onModalClose] as const
}
