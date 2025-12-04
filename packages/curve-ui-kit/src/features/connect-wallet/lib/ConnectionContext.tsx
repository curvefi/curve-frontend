import { BrowserProvider } from 'ethers'
import { createContext, useContext, useMemo } from 'react'
import { useAccount, useConnectorClient } from 'wagmi'
import type { NetworkDef } from '@ui/utils'
import { useDebouncedValue } from '@ui-kit/hooks/useDebounce'
import { type Address } from '@ui-kit/utils'
import { ConnectState, type CurveApi, type LlamaApi, type Wallet } from './types'

const { FAILURE, LOADING } = ConnectState

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
  isHydrated: boolean
}

export const ConnectionContext = createContext<ConnectionContextValue>({
  connectState: LOADING,
  isHydrated: false,
})

/**
 * Detects if the wallet is in the process of reconnecting.
 * - `useAccount` and `useClient` are not always in sync, so check both
 * - `isReconnecting` is set when switching pages
 * - `isConnecting` is set when the wallet gets flipped from connecting to connected when loading,
 *   especially without any wallet plugin
 * Therefore, we use a very cumbersome condition to detect if we are reconnecting, and also need some debouncing 😭
 */
function useWagmiIsReconnecting(address?: Address) {
  const { isReconnecting, isConnected, isConnecting } = useAccount()
  const isConnectingDebounced = useDebouncedValue(isConnecting, { defaultValue: true })
  return !address && (isConnectingDebounced || isReconnecting || isConnected)
}

/**
 * Separate hook to get the wallet and provider from wagmi.
 * This is moved here so that it's only used once in the context provider.
 *
 * Note: When using private key accounts in Cypress tests, wagmi doesn't automatically
 * expose these accounts through eth_accounts RPC calls. This creates an incompatibility
 * with ethers BrowserProvider, which relies on eth_accounts to determine the signer address.
 */
export function useWagmiWallet() {
  const { data: client } = useConnectorClient()
  const address = client?.account?.address
  return {
    isReconnecting: useWagmiIsReconnecting(address),
    ...(useMemo(() => {
      const wallet = address &&
        client?.transport.request && {
          provider: { request: client.transport.request },
          account: { address }, // the ensName is set later when detected
        }
      return { wallet, provider: wallet ? new BrowserProvider(wallet.provider) : null }
    }, [address, client?.transport.request]) ?? null),
  }
}

export const useConnection = () => useContext(ConnectionContext)
