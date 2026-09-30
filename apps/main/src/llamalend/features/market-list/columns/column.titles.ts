import { NET_SUPPLY_RATE_TITLE, ESTIMATED_NET_BORROW_APR_TITLE } from '@/llamalend/constants'
import { AVERAGE_CATEGORIES } from '@evm-ui/utils'
import { t } from '@ui/lib/i18n'
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
  [MarketColumnId.UserLiquidationBuffer]: t`Liquidation buffer`,
  [MarketColumnId.UserLiquidationRange]: t`Liquidation range`,
  [MarketColumnId.UserDistanceToRange]: t`Distance to range`,
  [MarketColumnId.UserBandCount]: t`Band count`,
  [MarketColumnId.UserCollateralComposition]: t`Collateral composition`,
  [MarketColumnId.UserBorrowed]: t`Borrow Amount`,
  [MarketColumnId.UserCollateral]: t`Collateral Amount`,
  [MarketColumnId.UserLtv]: t`LTV`,
  [MarketColumnId.UserReturnOnEquity]: t`RoE`,
  [MarketColumnId.UserLeverage]: t`Leverage`,
  [MarketColumnId.UserBoostMultiplier]: t`Boost`,
  [MarketColumnId.UserEarnings]: t`Interest earned`,
  [MarketColumnId.UserSupplyShare]: t`% of supply`,
  [MarketColumnId.SupplyIncentivesApr]: t`Incentives APR`,
  [MarketColumnId.UserDeposited]: t`Supplied Amount`,
  [MarketColumnId.BorrowRate]: t`Borrow APR`,
  [MarketColumnId.NetBorrowRate]: t`Net Borrow APR`,
  [MarketColumnId.CollateralYield]: t`Collateral yield`,
  [MarketColumnId.LendRate]: NET_SUPPLY_RATE_TITLE,
  [MarketColumnId.NetSupplyRate]: t`Net supply APY`,
  [MarketColumnId.BorrowChart]: t`${AVERAGE_CATEGORIES['llamalend.marketList.rate'].period} Borrow APR`,
  [MarketColumnId.MaxLtv]: t`Max LTV`,
  [MarketColumnId.MaxLeverage]: t`Max Leverage`,
  [MarketColumnId.MaxReturnOnEquity]: t`Max RoE`,
  [MarketColumnId.UtilizationPercent]: t`Utilization`,
  [MarketColumnId.SolvencyPercent]: t`Solvency`,
  [MarketColumnId.LiquidityUsd]: t`Available Liquidity`,
  [MarketColumnId.Tvl]: t`TVL`,
  [MarketColumnId.TotalDebt]: t`Total Debt`,
  [MarketColumnId.TotalCollateralUsd]: t`Total Collateral`,
} as const

/** Borrow-position table renames. The markets list keeps `MARKET_TITLES`. */
export const POSITION_COLUMN_LABELS = {
  totalDebt: t`Total debt`,
  collateralValue: t`Collateral value`,
  netBorrowApr: t`Net borrow APR`,
  marketSolvency: t`Market solvency`,
} as const

export const BETA_MARKET_TITLES: Partial<Record<MarketColumnId, string>> = {
  [MarketColumnId.NetBorrowRate]: ESTIMATED_NET_BORROW_APR_TITLE,
  [MarketColumnId.LendRate]: t`Supply APY`,
  [MarketColumnId.CollateralYield]: t`Collateral yield APR`,
  [MarketColumnId.UserSupplyShare]: t`Supply share`,
  [MarketColumnId.UserDeposited]: t`Amount supplied`,
  [MarketColumnId.SolvencyPercent]: POSITION_COLUMN_LABELS.marketSolvency,
}

export const BETA_ROE_TITLES = { position: t`Est. leveraged APR`, max: t`Est. max leveraged APR` } as const
