import { Eip1193Provider } from 'ethers'
import { useCallback, useState } from 'react'
import { useAccount, useChainId, useClient, useConnect, useConnectors, useDisconnect, useEnsName } from 'wagmi'
import type { Wallet } from '../types'
import { clientToProvider } from './adapter'
import { supportedWallets } from './wallets'

export const useWagmi = () => {
  const [label, setLabel] = useState('')

  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const connectors = useConnectors()

  const { address, isConnecting } = useAccount()
  const { data: ensName } = useEnsName({ address })
  const chainId = useChainId()

  const client = useClient()
  const provider = clientToProvider(client)

  const wallet: Wallet | null = address
    ? {
        label,
        account: { address, ensName: ensName || undefined },
        chainId,
        provider: {
          request(request: { method: string; params?: Array<any> | Record<string, any> }): Promise<any> {
            return provider.send(request.method, request.params ?? [])
          },
        } satisfies Eip1193Provider,
      }
    : null

  const connectWagmi = useCallback(
    (label?: string) => {
      const connectorType = label && supportedWallets.find((w) => w.label === label)?.connector
      if (!connectorType) {
        throw new Error(`Connector type ${label} is not supported`)
      }

      const connector = connectors.find((x) => x.id === connectorType)
      if (!connector) {
        throw new Error(`Could not find connector ${connectorType}`)
      }

      connect({ connector })
      setLabel(label)
    },
    [connect, connectors],
  )

  return [{ wallet, connecting: isConnecting }, connectWagmi, disconnect] as const
}
