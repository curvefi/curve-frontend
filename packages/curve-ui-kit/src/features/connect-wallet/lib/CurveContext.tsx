import { BrowserProvider } from 'ethers'
import { createContext, useContext, useMemo } from 'react'
import { useConnectorClient } from 'wagmi'
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
}

export const CurveContext = createContext<CurveContextValue>({
  connectState: LOADING,
  isHydrated: false,
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
  const request = client?.transport.request
  const wallet = useMemo(
    () =>
      // `wallet.account.ensName` is set later when detected
      address && request ? { provider: { request }, account: { address } } : undefined,
    [address, request],
  )
  return {
    wallet,
    provider: useMemo(() => wallet && new BrowserProvider(wallet.provider), [wallet]),
  }
}

export const useCurve = () => useContext(CurveContext)
