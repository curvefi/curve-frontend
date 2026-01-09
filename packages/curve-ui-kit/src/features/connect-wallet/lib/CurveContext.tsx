import { BrowserProvider } from 'ethers'
import { createContext, useContext, useMemo } from 'react'
import { useConnection, useConnectorClient } from 'wagmi'
import type { NetworkDef } from '@ui/utils'
import { useDebouncedValue } from '@ui-kit/hooks/useDebounce'
import { type Address } from '@ui-kit/utils'
import { ConnectState, type CurveApi, type LlamaApi, type Wallet } from './types'

const { FAILURE, LOADING } = ConnectState

export const isFailure = (status: ConnectState) => status === FAILURE
export const isLoading = (status: ConnectState) => status === LOADING

type CurveContextValue = {
  connectState: ConnectState
  curveApi?: CurveApi
  llamaApi?: LlamaApi
  error?: unknown
  wallet?: Wallet
  provider?: BrowserProvider
  network?: NetworkDef
  isHydrated: boolean
  isReconnecting: boolean
}

export const CurveContext = createContext<CurveContextValue>({
  connectState: LOADING,
  isHydrated: false,
  isReconnecting: true,
})

/**
 * Detects if the wallet is in the process of reconnecting.
 * - `isReconnecting` is set when switching pages
 * - `isConnecting` is set when the wallet gets flipped from connecting to connected when loading,
 *   especially without any wallet plugin
 * Therefore, we use a very cumbersome condition to detect if we are reconnecting, and also need some debouncing 😭
 */
function useWagmiIsReconnecting(address?: Address) {
  const { isReconnecting, isConnected, isConnecting } = useConnection()
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
  const request = client?.transport.request
  const wallet = useMemo(
    () =>
      // `wallet.account.ensName` is set later when detected
      address && request ? { provider: { request }, account: { address } } : undefined,
    [address, request],
  )
  return {
    isReconnecting: useWagmiIsReconnecting(address),
    wallet,
    provider: useMemo(() => wallet && new BrowserProvider(wallet.provider), [wallet]),
  }
}

export const useCurve = () => useContext(CurveContext)
