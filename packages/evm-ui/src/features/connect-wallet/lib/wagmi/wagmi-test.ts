import { noop } from 'lodash'
import {
  type Chain,
  createWalletClient,
  custom,
  type CustomTransport,
  fallback,
  http,
  type JsonRpcAccount,
  type PrivateKeyAccount,
  type SendTransactionParameters,
} from 'viem'
import { privateKeyToAccount, toAccount } from 'viem/accounts'
import { createConnector, type CreateConnectorFn } from 'wagmi'
import { type Address, type Hex } from '@primitives/address.utils'
import { WAGMI_HTTP_OPTIONS } from './transports'

type ConnectParams<T> = { chainId?: number; isReconnecting?: boolean; withCapabilities: T }
type ConnectResult<T> = { accounts: readonly T[]; chainId: number }
type Account = { address: Address; capabilities: Record<string, unknown> }
type TestAccount = PrivateKeyAccount | JsonRpcAccount

/** Default custom transport for Cypress E2E tests, read-only */
const cypressTransport = (account: TestAccount, chain: Chain) => {
  // Dedicated local-account writer so eth_sendTransaction is signed with the provided private key.
  const writeClient = createWalletClient({ account, chain, transport: http(chain.rpcUrls.default.http[0]) })
  return custom({
    request: async ({ method, params: [param] }): Promise<unknown> => {
      if (method === 'eth_accounts') return [account.address]
      if (method === 'eth_sendTransaction') return writeClient.sendTransaction(param as SendTransactionParameters)
      throw new Error(`Unsupported method: ${method}, http fallback is used`)
    },
  })
}

export type CreateTestConnectorOptions = {
  /** A 32-byte private key or a 20-byte JSON-RPC account address, including the 0x prefix. */
  account: Hex
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
  transport?: (account: TestAccount) => CustomTransport
}

/**
 * Creates a wagmi test connector for Cypress.
 *
 * This connector is designed for use in test environments (e.g., Cypress) with optionally a testnet chain.
 * It creates a wallet using a private key or address to impersonate to test contract read and write calls
 * without relying on third-party browser extensions like MetaMask.
 */
export function createTestConnector({
  account: accountHex,
  chain,
  transport,
}: CreateTestConnectorOptions): CreateConnectorFn {
  const account = accountHex.length === 42 ? toAccount(accountHex) : privateKeyToAccount(accountHex)

  const client = createWalletClient({
    account,
    chain,
    transport: fallback([
      (transport ?? cypressTransport)(account, chain),
      ...chain.rpcUrls.default.http.map(url => http(url, WAGMI_HTTP_OPTIONS)),
    ]),
  })

  // A connect function with overloads to satisfy Wagmi's conditional return type
  function connect(params: ConnectParams<true>): Promise<ConnectResult<Account>>
  function connect(params?: ConnectParams<false>): Promise<ConnectResult<Address>>
  // eslint-disable-next-line @typescript-eslint/require-await -- Existing violation before enabling this rule.
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
    disconnect: () => Promise.resolve(undefined),

    getAccounts: () => Promise.resolve([account.address]),
    getChainId: () => Promise.resolve(chain.id),
    getProvider: () => Promise.resolve(client),

    isAuthorized: () => Promise.resolve(true),
    switchChain: () => Promise.resolve(chain),

    onAccountsChanged: noop,
    onChainChanged: noop,
    onDisconnect: noop,
  }))
}
