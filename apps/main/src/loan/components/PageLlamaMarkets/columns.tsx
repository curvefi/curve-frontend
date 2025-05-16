import { useMemo } from 'react'
import { LlamaMarketColumnId } from '@/loan/components/PageLlamaMarkets/columns.enum'
import { LlamaMarket } from '@/loan/entities/llama-markets'
import { useMediaQuery } from '@mui/material'
import { ColumnDef, createColumnHelper, FilterFnOption } from '@tanstack/react-table'
import { DeepKeys } from '@tanstack/table-core/build/lib/utils'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { VisibilityGroup } from '@ui-kit/shared/ui/DataTable/TableVisibilitySettingsPopover'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { CompactUsdCell, LineGraphCell, MarketTitleCell, PercentageCell, PriceCell, RateCell } from './cells'
import { boolFilterFn, filterByText, listFilterFn, multiFilterFn } from './filters'

const { ColumnWidth } = SizesAndSpaces

const columnHelper = createColumnHelper<LlamaMarket>()

/** Define a hidden column. */
const hidden = (id: DeepKeys<LlamaMarket>, filterFn: FilterFnOption<LlamaMarket>) =>
  columnHelper.accessor(id, {
    filterFn,
    meta: { hidden: true },
  })

type LlamaColumn = ColumnDef<LlamaMarket, any>

/** Columns for the lending markets table. */
export const LLAMA_MARKET_COLUMNS = [
  columnHelper.accessor(LlamaMarketColumnId.Assets, {
    header: t`Collateral • Borrow`,
    cell: MarketTitleCell,
    // size: ColumnWidth.lg,
    filterFn: filterByText,
  }),
  columnHelper.display({
    id: LlamaMarketColumnId.UserHealth,
    header: t`Health`,
    cell: PercentageCell,
    meta: { type: 'numeric', hideZero: true },
    size: ColumnWidth.sm,
    sortUndefined: 'last',
  }),
  columnHelper.display({
    id: LlamaMarketColumnId.UserBorrowed,
    header: t`Borrow Amount`,
    cell: PriceCell,
    meta: { type: 'numeric', borderRight: true },
    size: ColumnWidth.sm,
    sortUndefined: 'last',
  }),
  columnHelper.display({
    id: LlamaMarketColumnId.UserEarnings,
    header: t`My Earnings`,
    cell: PriceCell,
    meta: { type: 'numeric' },
    size: ColumnWidth.sm,
    sortUndefined: 'last',
  }),
  columnHelper.display({
    id: LlamaMarketColumnId.UserDeposited,
    header: t`Supplied Amount`,
    cell: PriceCell,
    meta: { type: 'numeric', borderRight: true },
    size: ColumnWidth.sm,
    filterFn: boolFilterFn,
    sortUndefined: 'last',
  }),
  columnHelper.accessor(LlamaMarketColumnId.BorrowRate, {
    header: t`7D Avg Borrow Rate`,
    cell: (c) => <RateCell market={c.row.original} type="borrow" />,
    meta: { type: 'numeric' },
    size: ColumnWidth.sm,
    sortUndefined: 'last',
  }),
  columnHelper.accessor('rates.borrow', {
    id: LlamaMarketColumnId.BorrowChart,
    header: t`7D Borrow Rate Chart`,
    cell: (c) => <LineGraphCell market={c.row.original} type="borrow" />,
    size: ColumnWidth.md,
  }),
  columnHelper.accessor(LlamaMarketColumnId.LendRate, {
    header: t`7D Avg Supply Yield`,
    cell: (c) => <RateCell market={c.row.original} type="lend" />,
    meta: { type: 'numeric' },
    size: ColumnWidth.sm,
    sortUndefined: 'last',
  }),
  columnHelper.accessor('rates.lend', {
    id: LlamaMarketColumnId.LendChart,
    header: t`7D Supply Yield Chart`,
    cell: (c) => <LineGraphCell market={c.row.original} type="lend" />,
    size: ColumnWidth.md,
    sortUndefined: 'last',
  }),
  columnHelper.accessor(LlamaMarketColumnId.UtilizationPercent, {
    header: t`Utilization`,
    cell: PercentageCell,
    meta: { type: 'numeric' },
    size: ColumnWidth.sm,
  }),
  columnHelper.accessor(LlamaMarketColumnId.LiquidityUsd, {
    header: t`Available Liquidity`,
    cell: CompactUsdCell,
    meta: { type: 'numeric' },
    size: ColumnWidth.sm,
  }),
  // Following columns are used in tanstack filter, but they are displayed together in MarketTitleCell
  hidden(LlamaMarketColumnId.Chain, multiFilterFn),
  hidden(LlamaMarketColumnId.CollateralSymbol, multiFilterFn),
  hidden(LlamaMarketColumnId.BorrowedSymbol, multiFilterFn),
  hidden(LlamaMarketColumnId.IsFavorite, boolFilterFn),
  hidden(LlamaMarketColumnId.UserHasPosition, boolFilterFn),
  hidden(LlamaMarketColumnId.Rewards, listFilterFn),
  hidden(LlamaMarketColumnId.Type, multiFilterFn),
] satisfies LlamaColumn[]

export const DEFAULT_SORT = [{ id: LlamaMarketColumnId.LiquidityUsd, desc: true }]

export const useDefaultMarketColumnsVisibility: () => VisibilityGroup<LlamaMarketColumnId>[] = () => {
  const { wallet } = useWallet()
  const isMobile = useMediaQuery((t) => t.breakpoints.down('tablet'))
  const isUserConnected = !!wallet
  return useMemo(
    () => [
      {
        label: t`Markets`,
        options: [
          {
            label: t`Available Liquidity`,
            columns: [LlamaMarketColumnId.LiquidityUsd],
            active: true,
            enabled: !isMobile,
          },
          {
            label: t`Utilization`,
            columns: [LlamaMarketColumnId.UtilizationPercent],
            active: true,
            enabled: !isMobile,
          },
        ],
      },
      {
        label: t`Borrow`,
        options: [
          { columns: [LlamaMarketColumnId.BorrowRate], active: true, enabled: true },
          { label: t`Chart`, columns: [LlamaMarketColumnId.BorrowChart], active: true, enabled: !isMobile },
          {
            label: t`Borrow Details`,
            columns: [LlamaMarketColumnId.UserHealth, LlamaMarketColumnId.UserBorrowed],
            active: true,
            enabled: !isMobile && isUserConnected,
          },
        ],
      },
      {
        label: t`Lend`,
        options: [
          { columns: [LlamaMarketColumnId.LendRate], active: true, enabled: !isMobile },
          { label: t`Chart`, columns: [LlamaMarketColumnId.LendChart], active: false, enabled: !isMobile },
          {
            label: t`Lend Details`,
            columns: [LlamaMarketColumnId.UserEarnings, LlamaMarketColumnId.UserDeposited],
            active: true,
            enabled: !isMobile && isUserConnected,
          },
        ],
      },
    ],
    [isUserConnected, isMobile],
  )
}

export const LLAMA_MARKET_SORT_OPTIONS = LLAMA_MARKET_COLUMNS.filter((c) => c.id && c.enableSorting !== false).map(
  ({ id, header }) => ({
    id: id as LlamaMarketColumnId,
    label: header as string,
  }),
)

console.log({ LLAMA_MARKET_SORT_OPTIONS, LLAMA_MARKET_COLUMNS })
