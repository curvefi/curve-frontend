/** This file contains various custom chain specific constants and overrides */
import { Chain } from '@evm-ui/utils'
import type { PartialRecord } from '@primitives/objects.utils'

export const CHAIN_NAMES: Readonly<PartialRecord<number, string>> = {
  [Chain.Arbitrum]: 'Arbitrum',
  [Chain.Optimism]: 'Optimism',
  [Chain.Hyperliquid]: 'Hyperliquid',
  [Chain.Kava]: 'Kava',
  [Chain.Robinhood]: 'Robinhood',
  [Chain.Stable]: 'Stable',
  [Chain.Taiko]: 'Taiko',
  [Chain.XLayer]: 'X Layer',
  [Chain.Xdc]: 'XDC',
}

/** Basically full networks (so non-lite), unless they've been downgraded afterwards */
export const CHAIN_BLOCKCHAIN_IDS = {
  [Chain.Ethereum]: 'ethereum',
  [Chain.Optimism]: 'optimism',
  [Chain.Gnosis]: 'xdai',
  [Chain.Moonbeam]: 'moonbeam',
  [Chain.Polygon]: 'polygon',
  [Chain.Kava]: 'kava',
  [Chain.Fantom]: 'fantom',
  [Chain.Arbitrum]: 'arbitrum',
  [Chain.Avalanche]: 'avalanche',
  [Chain.Celo]: 'celo',
  [Chain.Aurora]: 'aurora',
  [Chain.ZkSync]: 'zksync',
  [Chain.Base]: 'base',
  [Chain.Bsc]: 'bsc',
  [Chain.Fraxtal]: 'fraxtal',
  [Chain.XLayer]: 'x-layer',
  [Chain.Mantle]: 'mantle',
  [Chain.Sonic]: 'sonic',
  [Chain.Hyperliquid]: 'hyperliquid',
} as const satisfies PartialRecord<number, string>
