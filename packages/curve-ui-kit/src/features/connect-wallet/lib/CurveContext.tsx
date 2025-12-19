import { BrowserProvider } from 'ethers'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useConnectorClient, useReconnect } from 'wagmi'
import type { NetworkDef } from '@ui/utils'
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
  const { mutateAsync: reconnectAsync } = useReconnect()
  const [isReconnecting, setIsReconnecting] = useState(true)

  useEffect(() => {
    void reconnectAsync()
      .catch((e) => console.warn('wagmi reconnect failed', e))
      .finally(() => setIsReconnecting(false))
  }, [reconnectAsync])
  return {
    isReconnecting,
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

export const useCurve = () => useContext(CurveContext)
