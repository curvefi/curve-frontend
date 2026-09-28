import { defineChain, http, type Address } from 'viem'
import { arbitrum, mainnet, optimism } from 'viem/chains'
import type { TenderlyConfig } from '@cy/support/helpers/tenderly/account'
import { createWagmiConfig } from '@evm-ui/features/connect-wallet'
import { assert } from '@primitives/objects.utils'
import { createTenderlyConnector } from './connector'

/** Configuration options for creating a test Wagmi config */
type Options = {
  /** A 32-byte private key or a 20-byte address to impersonate */
  account: Address
  /** RPC URL for the Ethereum network */
  rpcUrl: string
  /** Block explorer URL for the network */
  explorerUrl?: string
  /** Chain ID for the test network */
  chainId: number | string
  /** Tenderly configuration  */
  tenderly: TenderlyConfig
}

const getTestChain = (chainId: number | string) =>
  assert(
    // Tenderly recommends chain 73571 to prevent replay attacks, but our code relies on `chainId === Chain.Ethereum`. However, we do not use wallets with real funds.
    [mainnet, arbitrum, optimism].find(c => c.id === +chainId),
    `Unsupported chain ${chainId}`,
  ) as typeof mainnet

/** Creates a Wagmi configuration for a private-key or impersonated account on a Tenderly testnet. */
export function createTenderlyWagmiConfig({ account, rpcUrl, explorerUrl, chainId, tenderly }: Options) {
  const chain = defineChain({
    ...getTestChain(chainId),
    rpcUrls: { default: { http: [rpcUrl] } },
    blockExplorers: explorerUrl ? { default: { name: 'Tenderly Explorer', url: explorerUrl } } : undefined,
  })

  return createWagmiConfig({
    chains: [chain],
    transports: { [chain.id]: http(rpcUrl) },
    connectors: [createTenderlyConnector({ account, chain, tenderly })],
  })
}
