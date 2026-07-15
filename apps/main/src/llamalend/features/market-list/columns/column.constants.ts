import { MarketColumnId } from '../columns'

export const DEFAULT_SORT = [{ id: MarketColumnId.Tvl, desc: true }]
export const DEFAULT_SORT_BORROW = [{ id: MarketColumnId.UserHealth, desc: false }]
export const DEFAULT_SORT_SUPPLY = [{ id: MarketColumnId.UserDeposited, desc: true }]
