import { createWalletClient, http, type Chain, type Hex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { createConnector, type CreateConnectorFn } from '@wagmi/core'

type Options = {
  /** A hexadecimal private key used to generate a test account */
  privateKey: Hex
  /** The testnet chain configuration */
  chain: Chain
}

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

  return createConnector(() => ({
    id: 'test',
    name: 'Test Connector',
    type: 'test',

    connect: async () => ({ accounts: [account.address], chainId: chain.id }),
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
