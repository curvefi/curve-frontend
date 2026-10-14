import { useConnection } from 'wagmi'
import { notFalsyArray } from '@primitives/objects.utils'
import { MARKET_TITLES } from '../columns/column.titles'
import { MarketColumnId } from '../columns/columns.enum'

const USER_SORT_COLUMNS = [
  MarketColumnId.UserHealth,
  MarketColumnId.UserBorrowed,
  MarketColumnId.UserCollateral,
  MarketColumnId.UserLtv,
  MarketColumnId.UserDeposited,
  MarketColumnId.UserBoostMultiplier,
]

const MARKET_SORT_COLUMNS = [
  MarketColumnId.BorrowRate,
  MarketColumnId.NetBorrowRate,
  MarketColumnId.CollateralYield,
  MarketColumnId.SupplyRate,
  MarketColumnId.NetSupplyRate,
  MarketColumnId.Tvl,
  MarketColumnId.MaxLtv,
  MarketColumnId.MaxLeverage,
  MarketColumnId.MaxReturnOnEquity,
  MarketColumnId.UtilizationPercent,
  MarketColumnId.LiquidityUsd,
  MarketColumnId.TotalCollateralUsd,
  MarketColumnId.TotalDebt,
]

/** Creates a list of select options for sorting the Llama Market table (used for mobile only) */
export const useMarketsSortOptions = () => {
  const { isConnected } = useConnection()
  return notFalsyArray([MarketColumnId.Assets], isConnected && USER_SORT_COLUMNS, MARKET_SORT_COLUMNS).map(id => ({
    id,
    label: MARKET_TITLES[id],
  }))
}
