import { BrowserProvider } from 'ethers'
import { createContext, useContext, useMemo } from 'react'
import { useAccount, useConnectorClient } from 'wagmi'
import type { NetworkDef } from '@ui/utils'
import { ConnectState, type CurveApi, type LlamaApi, type Wallet } from './types'

const { FAILURE, LOADING, SUCCESS } = ConnectState

export const isSuccess = (status: ConnectState) => status === SUCCESS
export const isFailure = (status: ConnectState) => status === FAILURE
export const isLoading = (status: ConnectState) => status === LOADING

type ConnectionContextValue = {
  connectState: ConnectState
  curveApi?: CurveApi
  llamaApi?: LlamaApi
  error?: unknown
  wallet?: Wallet
  provider?: BrowserProvider
  network?: NetworkDef
}

export const ConnectionContext = createContext<ConnectionContextValue>({
  connectState: LOADING,
})

/**
 * Separate hook to get the wallet and provider from wagmi.
 * This is moved here so that it's only used once in the context provider.
 */
export function useWagmiWallet() {
  const { data: client } = useConnectorClient()
  const address = client?.account?.address
  const { isReconnecting, isConnected } = useAccount()
  return {
    // `useAccount` and `useClient` are not always in sync, so check both. `isReconnecting` is set when switching pages
    isReconnecting: !address && (isReconnecting || isConnected),
    ...(useMemo(() => {
      const wallet = address &&
        client?.transport.request && {
          provider: { request: client.transport.request },
          account: { address }, // the ensName is set later when detected
          chainId: client.chain.id,
        }
      return { wallet, provider: wallet ? new BrowserProvider(wallet.provider) : null }
    }, [address, client?.chain.id, client?.transport.request]) ?? null),
  }
}

export const useConnection = () => useContext(ConnectionContext)
