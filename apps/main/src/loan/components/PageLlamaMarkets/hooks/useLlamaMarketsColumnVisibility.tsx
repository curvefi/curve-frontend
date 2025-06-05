import { LlamaMarketColumnId } from '@/loan/components/PageLlamaMarkets/columns.enum'
import { fromEntries, recordValues } from '@curvefi/prices-api/objects.util'
import { t } from '@ui-kit/lib/i18n'

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
export const createLlamaMarketsColumnOptions = (hasPositions: boolean | undefined) =>
  hasPositions == null
    ? []
    : [
        {
          label: t`Markets`,
          options: [
            {
              label: t`Available Liquidity`,
              columns: [LlamaMarketColumnId.LiquidityUsd],
              active: true,
              enabled: true,
            },
            {
              label: t`Utilization`,
              columns: [LlamaMarketColumnId.UtilizationPercent],
              active: true,
              enabled: true,
            },
            {
              label: t`Chart`,
              columns: [LlamaMarketColumnId.BorrowChart],
              active: true,
              enabled: false,
            },
          ],
        },
        {
          label: t`Borrow`,
          options: [
            { columns: [LlamaMarketColumnId.BorrowRate], active: true, enabled: true },
            {
              label: t`Borrow Details`,
              columns: [LlamaMarketColumnId.UserHealth, LlamaMarketColumnId.UserBorrowed],
              active: true,
              enabled: hasPositions,
            },
          ],
        },
        {
          label: t`Lend`,
          options: [
            { columns: [LlamaMarketColumnId.LendRate], active: true, enabled: true },
            {
              label: t`Lend Details`,
              columns: [LlamaMarketColumnId.UserEarnings, LlamaMarketColumnId.UserDeposited],
              active: true,
              enabled: hasPositions,
            },
          ],
        },
      ]
