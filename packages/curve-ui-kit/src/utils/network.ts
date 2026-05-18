import type { Chain as BlockchainId } from '@curvefi/prices-api'
import { Chain } from '@primitives/network.utils'
import { assert } from '@primitives/objects.utils'

// TODO: remove this re-export after callers migrate to @primitives/network.utils
export { Chain }

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
} satisfies Partial<Record<Chain, BlockchainId>> as Partial<Record<number, BlockchainId>>

/**
 * Converts a numeric chain ID to the prices API blockchain identifier.
 * @param chainId - The numeric chain ID from the Chain enum
 * @throws Error if the chain ID is not supported by the prices API
 */
export const requireBlockchainId = (chainId: Chain) =>
  assert(BlockchainIds[chainId], `Could not find matching blockchainId for chainId (${chainId})`)

/**
 * Maps prices API blockchain identifiers to numeric chain IDs.
 * Reverse mapping of chainIdToBlockchainId.
 */
const ChainIds: Partial<Record<BlockchainId, Chain>> = {
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
export const requireChainId = (blockchainId: BlockchainId) =>
  assert(ChainIds[blockchainId], `Could not find matching chainId for blockchainId (${blockchainId})`)
