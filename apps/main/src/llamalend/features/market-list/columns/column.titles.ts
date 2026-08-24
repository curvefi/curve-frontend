import { NET_SUPPLY_RATE_TITLE } from '@/llamalend/constants'
import { t } from '@evm-ui/lib/i18n'
import { AVERAGE_CATEGORIES } from '@evm-ui/utils'
import { MarketColumnId } from './columns.enum'

/** Titles for the lending markets table. */
export const MARKET_TITLES: Record<MarketColumnId, string> = {
  [MarketColumnId.BorrowedSymbol]: t`Debt`,
  [MarketColumnId.CollateralSymbol]: t`Collateral`,
  [MarketColumnId.DeprecatedMessage]: t`Deprecated Message`,
  [MarketColumnId.Version]: t`Market Version`,
  [MarketColumnId.Type]: t`Market Type`,
  [MarketColumnId.Rewards]: t`Rewards`,
  [MarketColumnId.IsFavorite]: t`Favorites`,
  [MarketColumnId.Chain]: t`Network`,
  [MarketColumnId.Assets]: t`Collateral • Borrow`,
  [MarketColumnId.UserHealth]: t`Health`,
  [MarketColumnId.UserBorrowed]: t`Borrow Amount`,
  [MarketColumnId.UserCollateral]: t`Collateral Amount`,
  [MarketColumnId.UserLtv]: t`LTV`,
  [MarketColumnId.UserBoostMultiplier]: t`Boost`,
  [MarketColumnId.UserEarnings]: t`My Earnings`,
  [MarketColumnId.UserDeposited]: t`Supplied Amount`,
  [MarketColumnId.BorrowRate]: t`Borrow APR`,
  [MarketColumnId.NetBorrowRate]: t`Net Borrow APR`,
  [MarketColumnId.LendRate]: NET_SUPPLY_RATE_TITLE,
  [MarketColumnId.BorrowChart]: t`${AVERAGE_CATEGORIES['llamalend.marketList.rate'].period} Borrow APR`,
  [MarketColumnId.MaxLtv]: t`Max LTV`,
  [MarketColumnId.MaxLeverage]: t`Max Leverage`,
  [MarketColumnId.UtilizationPercent]: t`Utilization`,
  [MarketColumnId.SolvencyPercent]: t`Solvency`,
  [MarketColumnId.LiquidityUsd]: t`Available Liquidity`,
  [MarketColumnId.Tvl]: t`TVL`,
  [MarketColumnId.TotalDebt]: t`Total Debt`,
  [MarketColumnId.TotalCollateralUsd]: t`Total Collateral`,
} as const
