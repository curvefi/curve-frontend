import type { VisibilityGroup } from '@evm-ui/shared/ui/DataTable/visibility.types'
import { MarketRateType } from '@evm-ui/types/market'
import { fromEntries, recordValues } from '@primitives/objects.utils'
import { t } from '@ui/lib/i18n'
import { MARKET_TITLES } from './column.titles'
import { MarketColumnId } from './columns.enum'

/**
 * Create a map of column visibility for the markets table on mobile devices.
 * On mobile that is just the market title and the column that is currently sorted.
 */
export const createMarketsMobileColumns = (sortBy: MarketColumnId) =>
  fromEntries(recordValues(MarketColumnId).map(key => [key, key === MarketColumnId.Assets || key === sortBy]))

/**
 * Create a map of column visibility for the markets table that can be customized by the user.
 * This is not used on mobile devices (see `createMarketsMobileColumns` above).
 * @param hasPositions Whether the user is connected and has positions. Undefined during loading.
 * @param onlyPositions If set, only show columns related to the given position type.
 *      Otherwise, show all columns related to general market info and both position types (optionally).
 */
const createMarketsColumnOptions = ({
  hasPositions,
  onlyPositions,
}: {
  hasPositions: boolean
  onlyPositions?: MarketRateType
}): VisibilityGroup<MarketColumnId>[] => [
  {
    label: t`Markets`,
    options: [
      {
        label: MARKET_TITLES[MarketColumnId.MaxLeverage],
        columns: [MarketColumnId.MaxLeverage],
        active: !onlyPositions,
        enabled: true,
      },
      {
        label: MARKET_TITLES[MarketColumnId.LiquidityUsd],
        columns: [MarketColumnId.LiquidityUsd],
        active: !onlyPositions,
        enabled: true,
      },
      {
        label: MARKET_TITLES[MarketColumnId.MaxLtv],
        columns: [MarketColumnId.MaxLtv],
        active: false,
        enabled: true,
      },
      {
        label: MARKET_TITLES[MarketColumnId.UtilizationPercent],
        columns: [MarketColumnId.UtilizationPercent],
        active: !onlyPositions,
        enabled: true,
      },
      {
        label: MARKET_TITLES[MarketColumnId.SolvencyPercent],
        columns: [MarketColumnId.SolvencyPercent],
        active: false,
        enabled: true,
      },
      {
        label: MARKET_TITLES[MarketColumnId.TotalDebt],
        columns: [MarketColumnId.TotalDebt],
        active: false,
        enabled: true,
      },
      {
        label: MARKET_TITLES[MarketColumnId.TotalCollateralUsd],
        columns: [MarketColumnId.TotalCollateralUsd],
        active: false,
        enabled: true,
      },
      {
        label: MARKET_TITLES[MarketColumnId.Tvl],
        columns: [MarketColumnId.Tvl],
        active: !onlyPositions,
        enabled: true,
      },
    ],
  },
  {
    label: t`Borrow`,
    options: [
      {
        label: MARKET_TITLES[MarketColumnId.NetBorrowRate],
        columns: [MarketColumnId.NetBorrowRate],
        active: onlyPositions != MarketRateType.Supply,
        enabled: true,
      },
      {
        label: MARKET_TITLES[MarketColumnId.BorrowRate],
        columns: [MarketColumnId.BorrowRate],
        active: false,
        enabled: true,
      },
      {
        label: t`Borrow Details`,
        columns: [
          MarketColumnId.UserHealth,
          MarketColumnId.UserBorrowed,
          MarketColumnId.UserCollateral,
          MarketColumnId.UserLtv,
        ],
        active: onlyPositions == MarketRateType.Borrow,
        enabled: hasPositions,
      },
      {
        label: t`Chart`,
        columns: [MarketColumnId.BorrowChart],
        active: false,
        enabled: true,
      },
    ],
  },
  {
    label: t`Lend`,
    options: [
      {
        label: MARKET_TITLES[MarketColumnId.LendRate],
        columns: [MarketColumnId.LendRate],
        active: onlyPositions != MarketRateType.Borrow,
        enabled: true,
      },
      {
        label: t`Lend Details`,
        columns: [MarketColumnId.UserEarnings, MarketColumnId.UserDeposited, MarketColumnId.UserBoostMultiplier],
        active: onlyPositions == MarketRateType.Supply,
        enabled: hasPositions,
      },
    ],
  },
]

/** We keep visibility settings separately when the user has positions, since more columns are available. */
export const MARKETS_COLUMN_OPTIONS = {
  [MarketRateType.Borrow]: createMarketsColumnOptions({
    hasPositions: true,
    onlyPositions: MarketRateType.Borrow,
  }),
  [MarketRateType.Supply]: createMarketsColumnOptions({
    hasPositions: true,
    onlyPositions: MarketRateType.Supply,
  }),
  hasPositions: createMarketsColumnOptions({ hasPositions: true }),
  noPositions: createMarketsColumnOptions({ hasPositions: false }),
}
