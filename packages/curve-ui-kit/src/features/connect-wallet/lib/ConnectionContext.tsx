import { BrowserProvider } from 'ethers'
import { createContext, useContext, useMemo } from 'react'
import { useAccount, useConnectorClient } from 'wagmi'
import type { NetworkDef } from '@ui/utils'
import { isCypress } from '@ui-kit/utils'
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
 *
 * Note: When using private key accounts in Cypress tests, wagmi doesn't automatically
 * expose these accounts through eth_accounts RPC calls. This creates an incompatibility
 * with ethers BrowserProvider, which relies on eth_accounts to determine the signer address.
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
      hackSignerInCypress(wallet)
      return { wallet, provider: wallet ? new BrowserProvider(wallet.provider) : null }
    }, [address, client?.chain.id, client?.transport.request]) ?? null),
  }
}

/**
 * Hacks the eth_accounts RPC method for Cypress tests to return the correct wallet address.
 *
 * **Problem**:
 * - Wagmi with private key accounts (used in Cypress) doesn't expose accounts via eth_accounts
 * - eth_accounts typically returns accounts managed by injected wallets (like MetaMask)
 * - Private key accounts in wagmi/viem must be explicitly passed to actions, not hoisted to provider level
 * - Our curve libraries use ethers BrowserProvider, which calls eth_accounts to determine signer address
 * - This creates a mismatch where ethers can't find the correct signer address
 *
 * **Solution**:
 * Override the provider's eth_accounts response to return the wallet address from the private key account.
 * This bridges the incompatibility between wagmi's private key handling and ethers' expectation
 * that accounts are available through the standard eth_accounts RPC method.
 *
 * @see https://wagmi.sh/vue/guides/viem#private-key-mnemonic-accounts
 */
const hackSignerInCypress = (wallet: Wallet | undefined) => {
  const provider = wallet?.provider
  if (isCypress && provider) {
    const originalRequest = provider.request.bind(provider)
    provider.request = async (args: { method: string; [key: string]: any }) =>
      args?.method === 'eth_accounts' ? [wallet.account.address] : originalRequest(args)
  }
}

export const useConnection = () => useContext(ConnectionContext)
