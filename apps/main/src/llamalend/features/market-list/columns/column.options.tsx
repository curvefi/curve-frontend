import { fromEntries, recordValues } from '@curvefi/prices-api/objects.util'
import { t } from '@ui-kit/lib/i18n'
import type { VisibilityGroup } from '@ui-kit/shared/ui/DataTable/visibility.types'
import { MarketRateType } from '@ui-kit/types/market'
import { LlamaMarketColumnId } from './columns.enum'

/**
 * Create a map of column visibility for the Llama markets table on mobile devices.
 * On mobile that is just the market title and the column that is currently sorted.
 */
export const createLlamaMarketsMobileColumns = (sortBy: LlamaMarketColumnId) =>
  fromEntries(
    recordValues(LlamaMarketColumnId).map((key) => [key, key === LlamaMarketColumnId.Assets || key === sortBy]),
  )

/**
 * Create a map of column visibility for the Llama markets table that can be customized by the user.
 * This is not used on mobile devices (see `createLlamaMarketsMobileColumns` above).
 * @param hasPositions Whether the user is connected and has positions. Undefined during loading.
 * @param onlyPositions If set, only show columns related to the given position type.
 *      Otherwise, show all columns related to general market info and both position types (optionally).
 */
const createLlamaMarketsColumnOptions = ({
  hasPositions,
  onlyPositions,
}: {
  hasPositions: boolean
  onlyPositions?: MarketRateType
}): VisibilityGroup<LlamaMarketColumnId>[] => [
  {
    label: t`Markets`,
    options: [
      {
        label: t`Available Liquidity`,
        columns: [LlamaMarketColumnId.LiquidityUsd],
        active: !onlyPositions,
        enabled: true,
      },
      {
        label: t`Max LTV`,
        columns: [LlamaMarketColumnId.MaxLtv],
        active: false,
        enabled: true,
      },
      {
        label: t`Utilization`,
        columns: [LlamaMarketColumnId.UtilizationPercent],
        active: !onlyPositions,
        enabled: true,
      },
      {
        label: t`Total Debt`,
        columns: [LlamaMarketColumnId.TotalDebt],
        active: false,
        enabled: true,
      },
      {
        label: t`Total Collateral`,
        columns: [LlamaMarketColumnId.TotalCollateralUsd],
        active: false,
        enabled: true,
      },
      {
        label: t`TVL`,
        columns: [LlamaMarketColumnId.Tvl],
        active: !onlyPositions,
        enabled: true,
      },
      {
        label: t`Chart`,
        columns: [LlamaMarketColumnId.BorrowChart],
        active: false,
        enabled: true,
      },
    ],
  },
  {
    label: t`Borrow`,
    options: [
      {
        label: t`Net borrow APR`,
        columns: [LlamaMarketColumnId.NetBorrowRate],
        active: onlyPositions != MarketRateType.Supply,
        enabled: true,
      },
      {
        label: t`Borrow Details`,
        columns: [
          LlamaMarketColumnId.UserHealth,
          LlamaMarketColumnId.UserBorrowed,
          LlamaMarketColumnId.UserCollateral,
          LlamaMarketColumnId.UserLtv,
        ],
        active: onlyPositions == MarketRateType.Borrow,
        enabled: hasPositions,
      },
    ],
  },
  {
    label: t`Lend`,
    options: [
      {
        label: `Supply Yield`,
        columns: [LlamaMarketColumnId.LendRate],
        active: onlyPositions != MarketRateType.Borrow,
        enabled: true,
      },
      {
        label: t`Lend Details`,
        columns: [
          LlamaMarketColumnId.UserEarnings,
          LlamaMarketColumnId.UserDeposited,
          LlamaMarketColumnId.UserBoostMultiplier,
        ],
        active: onlyPositions == MarketRateType.Supply,
        enabled: hasPositions,
      },
    ],
  },
]

/**
 * We keep visibility settings separately when the user has positions, since more columns are available.
 */
export const LLAMA_MARKETS_COLUMN_OPTIONS = {
  [MarketRateType.Borrow]: createLlamaMarketsColumnOptions({
    hasPositions: true,
    onlyPositions: MarketRateType.Borrow,
  }),
  [MarketRateType.Supply]: createLlamaMarketsColumnOptions({
    hasPositions: true,
    onlyPositions: MarketRateType.Supply,
  }),
  hasPositions: createLlamaMarketsColumnOptions({ hasPositions: true }),
  noPositions: createLlamaMarketsColumnOptions({ hasPositions: false }),
  unknown: [],
}
