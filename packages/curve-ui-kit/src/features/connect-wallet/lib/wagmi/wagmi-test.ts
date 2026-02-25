import {
  createWalletClient,
  custom,
  fallback,
  http,
  type Chain,
  type CustomTransport,
  type PrivateKeyAccount,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { type CreateConnectorFn, createConnector } from 'wagmi'
import { type Address, type Hex } from '@primitives/address.utils'

type ConnectParams<T> = { chainId?: number; isReconnecting?: boolean; withCapabilities: T }
type ConnectResult<T> = { accounts: readonly T[]; chainId: number }
type Account = { address: Address; capabilities: Record<string, unknown> }

/** Default custom transport for Cypress E2E tests, read-only */
const cypressTransport = (account: PrivateKeyAccount) =>
  custom({
    request: async ({ method }): Promise<unknown> => {
      if (method === 'eth_accounts') {
        return [account.address]
      }
      throw new Error(`Unsupported method: ${method}, http fallback is used`)
    },
  })

export type CreateTestConnectorOptions = {
  /** A hexadecimal private key used to generate a test account */
  privateKey: Hex
  /** The testnet chain configuration */
  chain: Chain
  /**
   * Creates a custom transport that intercepts JSON-RPC requests to handle account retrieval and such.
   *
   * This is necessary because our code under test uses a BrowserProvider with http transport,
   * which relies on RPC methods not always available to retrieve accounts and send transactions.
   *
   * Defaults to a read-only custom transport for Cypress.
   */
  transport?: (account: PrivateKeyAccount) => CustomTransport
}

/**
 * Creates a wagmi test connector for Cypress.
 *
 * This connector is designed for use in test environments (e.g., Cypress) with optionally a testnet chain.
 * It creates a wallet using a custom seed (private key) to allow testing contract read and write calls
 * without relying on third-party browser extensions like MetaMask.
 */
export function createTestConnector({ privateKey, chain, transport }: CreateTestConnectorOptions): CreateConnectorFn {
  const account = privateKeyToAccount(privateKey)

  const client = createWalletClient({
    account,
    chain,
    transport: fallback([
      (transport ?? cypressTransport)(account),
      ...chain.rpcUrls.default.http.map((url) => http(url)),
    ]),
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
