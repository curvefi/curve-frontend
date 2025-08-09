import { defineChain, type Chain } from 'viem'
import { Chain as ChainId } from '@ui-kit/utils/network'
import {
  arbitrum,
  arbitrumSepolia,
  aurora,
  avalanche,
  base,
  bsc,
  celo,
  corn,
  fantom,
  fraxtal,
  gnosis,
  ink,
  kava,
  mantle,
  moonbeam,
  neonMainnet,
  optimism,
  plumeMainnet,
  polygon,
  sonic,
  taiko,
  xLayer,
  zksync,
} from '@wagmi/core/chains'
import type { Network } from '../types'
import { ethereum as mainnet, expchain, hyperliquid, megaeth, strata, tac } from './custom-chains'
import type { defaultGetRpcUrls } from './rpc'

export const wagmiChains = [
  mainnet,
  optimism,
  bsc,
  gnosis,
  polygon,
  sonic,
  xLayer,
  fantom,
  fraxtal,
  zksync,
  hyperliquid,
  moonbeam,
  kava,
  tac,
  mantle,
  megaeth,
  strata,
  base,
  expchain,
  arbitrum,
  celo,
  avalanche,
  ink,
  plumeMainnet,
  taiko,
  arbitrumSepolia,
  corn,
  neonMainnet,
  aurora,
] as const

/** Mapping of chain IDs to their corresponding Wagmi chain configurations for easy lookup */
export const wagmiChainsMap = Object.fromEntries(wagmiChains.map((chain) => [chain.id, chain]))

const DECIMALS: Record<number, number> = {
  [ChainId.Tac]: 8, // TAC has 8 decimals instead of 18
}

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
export const createChainFromNetwork = (network: Network, getRpcUrls: typeof defaultGetRpcUrls): Chain =>
  // use the backend data to configure new chains, but use wagmi contract addresses and useful properties/RPCs
  defineChain({
    ...(wagmiChainsMap[network.chainId] ?? {
      nativeCurrency: { name: network.symbol, symbol: network.symbol, decimals: DECIMALS[network.chainId] ?? 18 },
    }),
    id: network.chainId,
    testnet: network.isTestnet,
    name: network.name,
    rpcUrls: { default: { http: getRpcUrls(network.chainId, network.rpcUrl) } },
    ...(network.explorerUrl && {
      blockExplorers: { default: { name: new URL(network.explorerUrl).host, url: network.explorerUrl } },
    }),
  })
