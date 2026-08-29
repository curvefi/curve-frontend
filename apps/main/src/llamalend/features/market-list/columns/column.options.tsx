import { useMemo } from 'react'
import { t } from '@evm-ui/lib/i18n'
import type { VisibilityGroup } from '@evm-ui/shared/ui/DataTable/visibility.types'
import { MarketRateType } from '@evm-ui/types/market'
import { fromEntries, recordValues } from '@primitives/objects.utils'
import { useMarketTitles } from './column.titles'
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
  marketTitles,
}: {
  hasPositions: boolean
  onlyPositions?: MarketRateType
  marketTitles: Record<MarketColumnId, string>
}): VisibilityGroup<MarketColumnId>[] => [
  {
    label: t`Markets`,
    options: [
      {
        label: marketTitles[MarketColumnId.MaxLeverage],
        columns: [MarketColumnId.MaxLeverage],
        active: !onlyPositions,
        enabled: true,
      },
      {
        label: marketTitles[MarketColumnId.LiquidityUsd],
        columns: [MarketColumnId.LiquidityUsd],
        active: !onlyPositions,
        enabled: true,
      },
      {
        label: marketTitles[MarketColumnId.MaxLtv],
        columns: [MarketColumnId.MaxLtv],
        active: false,
        enabled: true,
      },
      {
        label: marketTitles[MarketColumnId.UtilizationPercent],
        columns: [MarketColumnId.UtilizationPercent],
        active: !onlyPositions,
        enabled: true,
      },
      {
        label: marketTitles[MarketColumnId.SolvencyPercent],
        columns: [MarketColumnId.SolvencyPercent],
        active: false,
        enabled: true,
      },
      {
        label: marketTitles[MarketColumnId.TotalDebt],
        columns: [MarketColumnId.TotalDebt],
        active: false,
        enabled: true,
      },
      {
        label: marketTitles[MarketColumnId.TotalCollateralUsd],
        columns: [MarketColumnId.TotalCollateralUsd],
        active: false,
        enabled: true,
      },
      {
        label: marketTitles[MarketColumnId.Tvl],
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
        label: marketTitles[MarketColumnId.NetBorrowRate],
        columns: [MarketColumnId.NetBorrowRate],
        active: onlyPositions != MarketRateType.Supply,
        enabled: true,
      },
      {
        label: marketTitles[MarketColumnId.BorrowRate],
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
        label: marketTitles[MarketColumnId.LendRate],
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
export const useMarketsColumnOptions = () => {
  const marketTitles = useMarketTitles()
  return useMemo(
    () => ({
      [MarketRateType.Borrow]: createMarketsColumnOptions({
        hasPositions: true,
        onlyPositions: MarketRateType.Borrow,
        marketTitles,
      }),
      [MarketRateType.Supply]: createMarketsColumnOptions({
        hasPositions: true,
        onlyPositions: MarketRateType.Supply,
        marketTitles,
      }),
      hasPositions: createMarketsColumnOptions({ hasPositions: true, marketTitles }),
      noPositions: createMarketsColumnOptions({ hasPositions: false, marketTitles }),
    }),
    [marketTitles],
  )
}
