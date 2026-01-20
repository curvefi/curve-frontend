import { LlamaMarketColumnId } from '../columns'

export const DEFAULT_SORT = [{ id: LlamaMarketColumnId.Tvl, desc: true }]
export const DEFAULT_SORT_BORROW = [{ id: LlamaMarketColumnId.UserHealth, desc: false }]
export const DEFAULT_SORT_SUPPLY = [{ id: LlamaMarketColumnId.UserDeposited, desc: true }]
