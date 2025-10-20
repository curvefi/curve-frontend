import { createWalletClient, http, type Chain, type Hex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { Address } from '@ui-kit/utils'
import { createConnector, type CreateConnectorFn } from '@wagmi/core'

type Options = {
  /** A hexadecimal private key used to generate a test account */
  privateKey: Hex
  /** The testnet chain configuration */
  chain: Chain
}

type ConnectParams<T> = { chainId?: number; isReconnecting?: boolean; withCapabilities: T }
type ConnectResult<T> = { accounts: readonly T[]; chainId: number }
type Account = { address: Address; capabilities: Record<string, unknown> }

/**
 * Cypress test connector for Wagmi.
 *
 * This connector is designed for use in test environments (e.g., Cypress) with a testnet chain.
 * It creates a wallet using a custom seed (private key) to allow testing contract write calls
 * without relying on third-party browser extensions like MetaMask.
 */
export function createTestConnector({ privateKey, chain }: Options): CreateConnectorFn {
  const account = privateKeyToAccount(privateKey)
  const client = createWalletClient({
    account,
    chain,
    transport: http(chain.rpcUrls.default.http[0]),
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
