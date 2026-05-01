import { defineChain, http } from 'viem'
import { arbitrum, mainnet } from 'viem/chains'
import type { TenderlyConfig } from '@cy/support/helpers/tenderly/account'
import { type Hex } from '@primitives/address.utils'
import { assert } from '@primitives/objects.utils'
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

const getTestChain = (chainId: number | string) =>
  assert(
    // Tenderly recommends chain 73571 to prevent replay attacks, but our code relies on `chainId === Chain.Ethereum`. However, we do not use wallets with real funds.
    [mainnet, arbitrum].find(c => c.id === +chainId),
    `Unsupported chain ${chainId}`,
  ) as typeof mainnet

/** Creates a Wagmi configuration for testing with a private key connector to a custom Tenderly (testnet) RPC */
export function createTenderlyWagmiConfig({ privateKey, rpcUrl, explorerUrl, chainId, tenderly }: Options) {
  const chain = defineChain({
    ...getTestChain(chainId),
    rpcUrls: { default: { http: [rpcUrl] } },
    blockExplorers: explorerUrl ? { default: { name: 'Tenderly Explorer', url: explorerUrl } } : undefined,
  })

  return createWagmiConfig({
    chains: [chain],
    transports: { [chain.id]: http(rpcUrl) },
    connectors: [createTenderlyConnector({ privateKey, chain, tenderly })],
  })
}
