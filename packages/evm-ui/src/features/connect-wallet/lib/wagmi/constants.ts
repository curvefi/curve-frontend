/** This file contains various custom chain specific constants and overrides */
import { Chain } from '@primitives/network.utils'
import type { PartialRecord } from '@primitives/objects.utils'

export const CHAIN_NAMES: PartialRecord<number, string> = {
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
