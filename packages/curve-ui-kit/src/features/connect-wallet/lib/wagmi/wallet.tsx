import { Eip1193Provider } from 'ethers'
import { type ReactNode, useCallback, useState } from 'react'
import { useClient } from 'wagmi'
import { connect, disconnect } from '@wagmi/core'
import { WagmiConnectModal } from '../../ui/WagmiConnectModal'
import type { Wallet } from '../types'
import { clientToProvider } from './adapter'
import { config, SupportedWallets } from './setup'

export const useWagmiWallet = () => {
  const [modal, setModal] = useState<ReactNode>()
  const [connecting, setConnecting] = useState(false)
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const client = useClient()

  const connectWagmi = useCallback(
    async (label?: string): Promise<Wallet | null> => {
      const connector = label && SupportedWallets.find((w) => w.label === label)?.connector
      if (!connector) {
        setModal(<WagmiConnectModal onConnect={connectWagmi} />)
        return null
      }

      setConnecting(true)
      try {
        const { accounts, chainId } = await connect(config, { connector })
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
    [client],
  )

  const disconnectWagmi = useCallback(() => disconnect(config), [])

  return [{ wallet, connecting, modal, client }, connectWagmi, disconnectWagmi] as const
}
