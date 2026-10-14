import { recordValues } from '@primitives/objects.utils'
import { MarketColumnId } from './columns.enum'

export const MARKET_COLUMN_IDS: ReadonlySet<string> = new Set(recordValues(MarketColumnId))

export const DEFAULT_SORT = [{ id: MarketColumnId.Tvl, desc: true }]
export const DEFAULT_SORT_BORROW = [{ id: MarketColumnId.UserBorrowed, desc: true }]
export const DEFAULT_SORT_SUPPLY = [{ id: MarketColumnId.UserDeposited, desc: true }]
