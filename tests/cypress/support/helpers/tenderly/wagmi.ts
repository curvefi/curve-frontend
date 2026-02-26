import { defineChain, http } from 'viem'
import { mainnet, arbitrum } from 'viem/chains'
import type { TenderlyConfig } from '@cy/support/helpers/tenderly/account'
import { type Hex } from '@primitives/address.utils'
import { createWagmiConfig } from '@ui-kit/features/connect-wallet'
import { createTenderlyConnector } from './connector'

/** Configuration options for creating a test Wagmi config */
type Options = {
  /** Private key for the test account */
  privateKey: Hex
  /** RPC URL for the Ethereum network */
  rpcUrl: string
  /** Block explorer URL for the network */
  explorerUrl?: string
  /** Chain ID for the test network */
  chainId: number | string
  /** Tenderly configuration  */
  tenderly: TenderlyConfig
}

/** Creates a Wagmi configuration for testing with a private key connector to a custom Tenderly (testnet) RPC */
export function createTenderlyWagmiConfig({ privateKey, rpcUrl, explorerUrl, chainId, tenderly }: Options) {
  // Tenderly docs recommends using chain ID 73571 to prevent replay attack, but a lot of our code relies on `if chain === Chain.Ethereum`.
  // Should be okay, since we're not using real life wallets. A browser wallet extension isn't even available.
  const chainDef = [mainnet, arbitrum].find((c) => c.id === +chainId) as typeof mainnet
  if (!chainDef) throw new Error(`Unsupported chain ID: ${chainId}`)

  const chain = defineChain({
    ...chainDef,
    rpcUrls: { default: { http: [rpcUrl] } },
    blockExplorers: explorerUrl ? { default: { name: 'Tenderly Explorer', url: explorerUrl } } : undefined,
  })

  return createWagmiConfig({
    chains: [chain],
    transports: { [chain.id]: http(rpcUrl) },
    connectors: [createTenderlyConnector({ privateKey, chain, tenderly })],
  })
}
