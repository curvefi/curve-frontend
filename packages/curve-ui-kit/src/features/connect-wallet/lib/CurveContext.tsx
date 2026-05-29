import { BrowserProvider } from 'ethers'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useConnection, useConnectorClient } from 'wagmi'
import type { NetworkDef } from '@ui/utils'
import { setUser } from '@ui-kit/features/sentry'
import type { Provider } from '@ui-kit/lib/ethers'
import { ConnectState, type CurveApi, type LlamaApi, type Wallet } from './types'

const { FAILURE, LOADING } = ConnectState

export const isFailure = (status: ConnectState) => status === FAILURE
export const isLoading = (status: ConnectState) => status === LOADING

interface CurveContextValue {
  connectState: ConnectState
  curveApi?: CurveApi
  llamaApi?: LlamaApi
  error?: unknown
  wallet?: Wallet
  provider?: Provider
  network?: NetworkDef
  isHydrated: boolean
  isInitialized: boolean
}

export const CurveContext = createContext<CurveContextValue>({
  connectState: LOADING,
  isHydrated: false,
  isInitialized: false,
})

/**
 * Blocks app init until wagmi settles the initial wallet state.
 * `useConnection()` and `useConnectorClient()` can resolve at different times, so once initialized, we keep returning true.
 */
function useWagmiIsInitialized(hasWallet: boolean) {
  const { isReconnecting, isConnected, isConnecting } = useConnection()
  const [wasInitialized, setWasInitialized] = useState(false)

  const isInitialized = !isConnecting && !isReconnecting && (!isConnected || hasWallet)
  // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
  useEffect(() => setWasInitialized(wasInitialized => isInitialized || wasInitialized), [isInitialized])
  return isInitialized || wasInitialized // note: use || since `isInitialized` is set one render before `wasInitialized`
}

/**
 * Reads the wagmi client once for the context provider.
 * Note: Cypress private key accounts may not expose `eth_accounts`, which BrowserProvider expects.
 */
export function useWagmiWallet() {
  const { data: client } = useConnectorClient()
  const address = client?.account?.address
  const request = client?.transport.request
  const chainId = client?.chain.id
  const wallet = useMemo(
    () => (address && request ? { provider: { request }, address } : undefined),
    [address, request],
  )
  useEffect(() => setUser({ address, chainId }), [address, chainId])
  return {
    isInitialized: useWagmiIsInitialized(!!address && !!request),
    wallet,
    provider: useMemo(() => wallet && new BrowserProvider(wallet.provider), [wallet]),
  }
}

// eslint-disable-next-line @eslint-react/no-use-context -- Existing violation before enabling this rule.
export const useCurve = () => useContext(CurveContext)
