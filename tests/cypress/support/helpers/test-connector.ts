import {
  type Chain,
  createWalletClient,
  custom,
  fallback,
  type Hex,
  http,
  PrivateKeyAccount,
  type RpcTransactionRequest,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import type { TenderlyConfig } from '@cy/support/helpers/tenderly/account'
import { Address } from '@ui-kit/utils'
import { createConnector, type CreateConnectorFn } from '@wagmi/core'
import { sendVnetTransaction } from './tenderly/vnet-transaction'

type Options = {
  /** A hexadecimal private key used to generate a test account */
  privateKey: Hex
  /** The testnet chain configuration */
  chain: Chain
  /** Tenderly configuration for the Virtual Testnet */
  tenderly: TenderlyConfig
}

type ConnectParams<T> = { chainId?: number; isReconnecting?: boolean; withCapabilities: T }
type ConnectResult<T> = { accounts: readonly T[]; chainId: number }
type Account = { address: Address; capabilities: Record<string, unknown> }

/**
 * Creates a custom transport that intercepts JSON-RPC requests to handle account retrieval and
 * transaction sending via Tenderly Virtual Testnet Admin API.
 *
 * This is necessary because our code under test uses a BrowserProvider with http transport,
 * which relies on RPC methods to retrieve accounts and send transactions.
 */
const customTransport = (account: PrivateKeyAccount, tenderly: TenderlyConfig) =>
  custom({
    request: async ({ method, params: [param] }): Promise<any> => {
      if (method === 'eth_accounts') {
        return [account.address]
      }
      if (method === 'eth_sendTransaction') {
        return await sendVnetTransaction({ tenderly, tx: param as RpcTransactionRequest }).catch((err) => {
          console.error(`Custom transport failed for method ${method}, falling back to HTTP transport. Error: ${err}`)
          throw err
        })
      }
      throw new Error(`Unsupported method: ${method}, http fallback is used`)
    },
  })

/**
 * Cypress test connector for Wagmi.
 *
 * This connector is designed for use in test environments (e.g., Cypress) with a testnet chain.
 * It creates a wallet using a custom seed (private key) to allow testing contract write calls
 * without relying on third-party browser extensions like MetaMask.
 */
export function createTestConnector({ privateKey, chain, tenderly }: Options): CreateConnectorFn {
  const account = privateKeyToAccount(privateKey)

  const client = createWalletClient({
    account,
    chain,
    transport: fallback([customTransport(account, tenderly), ...chain.rpcUrls.default.http.map((url) => http(url))]),
  })

  // A connect function with overloads to satisfy Wagmi's conditional return type
  function connect(params: ConnectParams<true>): Promise<ConnectResult<Account>>
  function connect(params?: ConnectParams<false>): Promise<ConnectResult<Address>>
  async function connect(params?: ConnectParams<boolean>): Promise<ConnectResult<Account | Address>> {
    return params?.withCapabilities
      ? { accounts: [{ address: account.address, capabilities: {} }], chainId: chain.id }
      : { accounts: [account.address], chainId: chain.id }
  }

  return createConnector(() => ({
    id: 'test',
    name: 'Test Connector',
    type: 'test',

    connect,
    disconnect: async () => {},

    getAccounts: async () => [account.address],
    getChainId: async () => chain.id,
    getProvider: async () => client,

    isAuthorized: async () => true,
    switchChain: async () => chain,

    onAccountsChanged: () => {},
    onChainChanged: () => {},
    onDisconnect: () => {},
  }))
}
