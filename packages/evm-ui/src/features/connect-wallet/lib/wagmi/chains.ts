import { defineChain, type Chain } from 'viem'
import { defaultGetRpcUrls } from '@evm-ui/features/connect-wallet/lib/wagmi/transports'
import {
  arbitrum,
  arbitrumSepolia,
  arcTestnet,
  aurora,
  avalanche,
  base,
  bsc,
  bscTestnet,
  celo,
  corn,
  etherlink,
  fantom,
  fraxtal,
  gnosis,
  hyperliquid,
  ink,
  kava,
  mainnet,
  mantle,
  monad,
  moonbeam,
  neonDevnet,
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
import { CHAIN_NAMES } from './constants'
import { expchain, megaeth, strata } from './custom-chains'

const wagmiChains = [
  arbitrum,
  arbitrumSepolia,
  arcTestnet,
  aurora,
  avalanche,
  base,
  bsc,
  bscTestnet,
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
  neonDevnet,
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

/**
 * Mapping of chain IDs to their corresponding Wagmi chain configurations for easy lookup
 * Note that this mapping is explicitly *not* exported, because we do a little massaging,
 * like custom names and such. Please use the exported helper functions below instead.
 */
const wagmiChainsMap = Object.fromEntries(wagmiChains.map(chain => [chain.id, chain]))

export const isChainConfigured = (chainId: number) => !!wagmiChainsMap[chainId]
export const isChainTestnet = (chainId: number) => !!wagmiChainsMap[chainId]?.testnet

export const getChainName = (chainId: number) =>
  CHAIN_NAMES[chainId] ?? wagmiChainsMap[chainId]?.name ?? `Chain ${chainId}`

export const getChainNativeCurrency = (chainId: number) => wagmiChainsMap[chainId]?.nativeCurrency
export const getChainBlockExplorer = (chainId: number) => wagmiChainsMap[chainId]?.blockExplorers?.default.url
export const getChainDefaultRpcUrls = (chainId: number) => wagmiChainsMap[chainId]?.rpcUrls.default.http

/** Creates a Wagmi / Viem chain configuration with potential custom overrides. */
export const createChain = (chainId: number, getRpcUrls: typeof defaultGetRpcUrls): Chain =>
  defineChain({ ...wagmiChainsMap[chainId], rpcUrls: { default: { http: getRpcUrls(chainId) } } })
