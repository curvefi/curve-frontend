import { defineChain, type Chain } from 'viem'
import { DEFAULT_DECIMALS } from '@primitives/objects.utils'
import type { NetworkDef } from '@ui/utils'
import { defaultGetRpcUrls } from '@ui-kit/features/connect-wallet/lib/wagmi/transports'
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
  mantle,
  monad,
  moonbeam,
  neonMainnet,
  optimism,
  plasma,
  plumeMainnet,
  polygon,
  sonic,
  stable,
  tac,
  taiko,
  unichain,
  xdc,
  xLayer,
  zksync,
} from '@wagmi/core/chains'
import { ethereum as mainnet, expchain, hyperliquid, megaeth, robinhood, strata } from './custom-chains'

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
export const DOWNGRADED_CHAINS = new Set<number>([avalanche, xLayer, sonic, fantom].map(c => c.id))

/** Mapping of chain IDs to their corresponding Wagmi chain configurations for easy lookup */
export const wagmiChainsMap = Object.fromEntries(wagmiChains.map(chain => [chain.id, chain]))

/**
 * Creates a Viem chain configuration from a Curve network definition.
 *
 * Uses existing Wagmi chain data when available, falling back to network-specific
 * configuration for custom chains. Handles special cases like TAC's 8-decimal precision.
 *
 * @param network - The network definition containing chain ID, name, RPC URL, etc.
 * @param getRpcUrls - Function to resolve RPC URLs for the chain
 * @returns A Viem Chain configuration ready for use with wagmi
 */
export const createChainFromNetwork = (network: NetworkDef, getRpcUrls: typeof defaultGetRpcUrls): Chain =>
  // use the backend data to configure new chains, but use wagmi contract addresses and useful properties/RPCs
  defineChain({
    ...(wagmiChainsMap[network.chainId] ?? {
      nativeCurrency: { name: network.symbol, symbol: network.symbol, decimals: DEFAULT_DECIMALS },
    }),
    id: network.chainId,
    testnet: network.isTestnet,
    name: network.name,
    rpcUrls: { default: { http: getRpcUrls(network.chainId, network.rpcUrl) } },
    ...(network.explorerUrl && {
      blockExplorers: { default: { name: new URL(network.explorerUrl).host, url: network.explorerUrl } },
    }),
  })
