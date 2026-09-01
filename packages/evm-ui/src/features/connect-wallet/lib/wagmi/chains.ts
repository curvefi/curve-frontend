import { defineChain, type Chain } from 'viem'
import { defaultGetRpcUrls } from '@evm-ui/features/connect-wallet/lib/wagmi/transports'
import type { NetworkDef } from '@legacy-ui/utils'
import {
  arbitrum,
  arbitrumSepolia,
  arcTestnet,
  aurora,
  avalanche,
  base,
  bsc,
  celo,
  corn,
  etherlink,
  fantom,
  fraxtal,
  gnosis,
  ink,
  kava,
  mainnet,
  mantle,
  monad,
  moonbeam,
  neonMainnet,
  optimism,
  plasma,
  plumeMainnet,
  polygon,
  robinhood,
  sonic,
  stable,
  tac,
  taiko,
  unichain,
  xdc,
  xLayer,
  zksync,
} from '@wagmi/core/chains'
import { expchain, hyperliquid, megaeth, strata } from './custom-chains'

const wagmiChains = [
  arbitrum,
  arbitrumSepolia,
  arcTestnet,
  aurora,
  avalanche,
  base,
  bsc,
  celo,
  corn,
  etherlink,
  expchain,
  fantom,
  fraxtal,
  gnosis,
  hyperliquid,
  ink,
  kava,
  mainnet,
  mantle,
  megaeth,
  monad,
  moonbeam,
  neonMainnet,
  optimism,
  plasma,
  plumeMainnet,
  polygon,
  robinhood,
  sonic,
  stable,
  strata,
  tac,
  taiko,
  unichain,
  xdc,
  xLayer,
  zksync,
] as const

const deprecateDate = new Date('2026-07-01')
export const DEPRECATED_CHAINS: Record<number, Date> = {
  [aurora.id]: deprecateDate,
  [kava.id]: deprecateDate,
}
export const DOWNGRADED_CHAINS = new Set<number>(
  [aurora, avalanche, celo, fantom, kava, mantle, moonbeam, sonic, xLayer, zksync].map(c => c.id),
)

/** Mapping of chain IDs to their corresponding Wagmi chain configurations for easy lookup */
export const wagmiChainsMap = Object.fromEntries(wagmiChains.map(chain => [chain.id, chain]))

/**
 * Creates a Viem chain configuration from a Curve network definition.
 *
 * Uses existing Wagmi chain data when available, falling back to network-specific
 * configuration for custom chains.
 *
 * @param network - The network definition containing chain ID, name, RPC URL, etc.
 * @param getRpcUrls - Function to resolve RPC URLs for the chain
 * @returns A Viem Chain configuration ready for use with wagmi
 */
export const createChainFromNetwork = (network: NetworkDef, getRpcUrls: typeof defaultGetRpcUrls): Chain =>
  // use the backend data to configure new chains, but use wagmi contract addresses and useful properties/RPCs
  defineChain({
    ...wagmiChainsMap[network.chainId],
    id: network.chainId,
    testnet: network.isTestnet,
    name: network.name,
    rpcUrls: { default: { http: getRpcUrls(network.chainId) } },
    ...(network.explorerUrl && {
      blockExplorers: { default: { name: new URL(network.explorerUrl).host, url: network.explorerUrl } },
    }),
  })
