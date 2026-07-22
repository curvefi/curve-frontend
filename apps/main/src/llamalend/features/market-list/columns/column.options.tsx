import { NET_SUPPLY_RATE_TITLE } from '@/llamalend/constants'
import { fromEntries, recordValues } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import type { VisibilityGroup } from '@ui-kit/shared/ui/DataTable/visibility.types'
import { MarketRateType } from '@ui-kit/types/market'
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
        label: t`Max leverage`,
        columns: [MarketColumnId.MaxLeverage],
        active: !onlyPositions,
        enabled: true,
      },
      {
        label: t`Available Liquidity`,
        columns: [MarketColumnId.LiquidityUsd],
        active: !onlyPositions,
        enabled: true,
      },
      {
        label: t`Max LTV`,
        columns: [MarketColumnId.MaxLtv],
        active: false,
        enabled: true,
      },
      {
        label: t`Utilization`,
        columns: [MarketColumnId.UtilizationPercent],
        active: !onlyPositions,
        enabled: true,
      },
      {
        label: t`Solvency`,
        columns: [MarketColumnId.SolvencyPercent],
        active: false,
        enabled: true,
      },
      {
        label: t`Total Debt`,
        columns: [MarketColumnId.TotalDebt],
        active: false,
        enabled: true,
      },
      {
        label: t`Total Collateral`,
        columns: [MarketColumnId.TotalCollateralUsd],
        active: false,
        enabled: true,
      },
      {
        label: t`TVL`,
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
        label: t`Net Borrow APR`,
        columns: [MarketColumnId.NetBorrowRate],
        active: onlyPositions != MarketRateType.Supply,
        enabled: true,
      },
      {
        label: t`Borrow APR`,
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
        label: NET_SUPPLY_RATE_TITLE,
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
