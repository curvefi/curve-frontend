import type { Chain as BlockchainId } from '@curvefi/prices-api'

/**
 * List of all hardcoded chains IDs. Does not include Lite chains.
 * TODO: use object as const instead of enum
 */
export enum Chain {
  Ethereum = 1,
  Optimism = 10,
  Gnosis = 100,
  Moonbeam = 1284,
  Polygon = 137,
  Kava = 2222,
  Fantom = 250,
  Arbitrum = 42161,
  Avalanche = 43114,
  Celo = 42220,
  Aurora = 1313161554,
  ZkSync = 324,
  Base = 8453,
  Bsc = 56,
  Fraxtal = 252,
  XLayer = 196,
  Mantle = 5000,
  Sonic = 146,
  Hyperliquid = 999,
  Xdc = 50,
  Tac = 2390,
  Corn = 21000000,
  Ink = 57073,
  Taiko = 167000,
  Plume = 98866,
  MegaEth = 6342,
  Strata = 8091,
  ExpChain = 18880,
  Monad = 143,
}

/**
 * Maps numeric chain IDs to prices API blockchain identifiers.
 * Not all chains are supported by the prices API, so this is a partial mapping.
 */
export const BlockchainIds = {
  [Chain.Ethereum]: 'ethereum',
  [Chain.Arbitrum]: 'arbitrum',
  [Chain.Optimism]: 'optimism',
  [Chain.Fantom]: 'fantom',
  [Chain.Gnosis]: 'xdai',
  [Chain.Base]: 'base',
  [Chain.Polygon]: 'polygon',
  [Chain.Fraxtal]: 'fraxtal',
  [Chain.Sonic]: 'sonic',
  [Chain.Hyperliquid]: 'hyperliquid',
  [Chain.Bsc]: 'bsc',
  [Chain.Taiko]: 'taiko',
} as const satisfies Partial<Record<Chain, BlockchainId>> as Partial<Record<number, BlockchainId>>

/**
 * Converts a numeric chain ID to the prices API blockchain identifier.
 * @param chainId - The numeric chain ID from the Chain enum
 * @throws Error if the chain ID is not supported by the prices API
 */
export function requireBlockchainId(chainId: Chain): BlockchainId {
  const blockchainId = BlockchainIds[chainId]
  if (!blockchainId) throw new Error(`Could not find matching blockchainId for chainId (${chainId})`)

  return blockchainId
}

/**
 * Maps prices API blockchain identifiers to numeric chain IDs.
 * Reverse mapping of chainIdToBlockchainId.
 */
export const ChainIds: Partial<Record<BlockchainId, Chain>> = {
  ethereum: Chain.Ethereum,
  arbitrum: Chain.Arbitrum,
  optimism: Chain.Optimism,
  fantom: Chain.Fantom,
  xdai: Chain.Gnosis,
  base: Chain.Base,
  polygon: Chain.Polygon,
  fraxtal: Chain.Fraxtal,
  sonic: Chain.Sonic,
  hyperliquid: Chain.Hyperliquid,
  bsc: Chain.Bsc,
  taiko: Chain.Taiko,
}

/**
 * Converts a prices API blockchain identifier to the numeric chain ID.
 * @param blockchainId - The blockchain ID string from the prices API
 * @throws Error if the blockchain ID is not mapped to a chain ID
 */
export function requireChainId(blockchainId: BlockchainId): Chain {
  const chainId = ChainIds[blockchainId]
  if (!chainId) throw new Error(`Could not find matching chainId for blockchainId (${blockchainId})`)

  return chainId
}
