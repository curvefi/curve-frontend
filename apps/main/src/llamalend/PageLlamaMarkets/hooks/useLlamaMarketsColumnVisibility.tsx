import { LlamaMarketColumnId } from '@/llamalend/PageLlamaMarkets/columns.enum'
import { fromEntries, recordValues } from '@curvefi/prices-api/objects.util'
import { t } from '@ui-kit/lib/i18n'
import type { VisibilityGroup } from '@ui-kit/shared/ui/DataTable'
import { MarketRateType } from '@ui-kit/types/market'

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
        label: t`Utilization`,
        columns: [LlamaMarketColumnId.UtilizationPercent],
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
        label: `Borrow Rate`,
        columns: [LlamaMarketColumnId.BorrowRate],
        active: onlyPositions != MarketRateType.Supply,
        enabled: true,
      },
      {
        label: t`Borrow Details`,
        columns: [LlamaMarketColumnId.UserHealth, LlamaMarketColumnId.UserBorrowed],
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
        columns: [LlamaMarketColumnId.UserEarnings, LlamaMarketColumnId.UserDeposited],
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
