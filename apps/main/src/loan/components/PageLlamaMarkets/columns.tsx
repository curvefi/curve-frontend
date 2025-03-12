import {
  CompactUsdCell,
  LineGraphCell,
  MarketTitleCell,
  RateCell,
  UtilizationCell,
} from '@/loan/components/PageLlamaMarkets/cells'
import { LlamaMarket } from '@/loan/entities/llama-markets'
import { ColumnDef, createColumnHelper, FilterFnOption } from '@tanstack/react-table'
import { DeepKeys } from '@tanstack/table-core/build/lib/utils'
import { t } from '@ui-kit/lib/i18n'
import { VisibilityGroup } from '@ui-kit/shared/ui/TableVisibilitySettingsPopover'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { ColumnWidth } = SizesAndSpaces

const columnHelper = createColumnHelper<LlamaMarket>()

const multiFilterFn: FilterFnOption<LlamaMarket> = (row, columnId, filterValue) =>
  !filterValue?.length || filterValue.includes(row.getValue(columnId))
const boolFilterFn: FilterFnOption<LlamaMarket> = (row, columnId, filterValue) =>
  filterValue === undefined || Boolean(row.getValue(columnId)) === Boolean(filterValue)

/** Define a hidden column. */
const hidden = (id: DeepKeys<LlamaMarket>, filterFn: FilterFnOption<LlamaMarket>) =>
  columnHelper.accessor(id, {
    filterFn,
    meta: { hidden: true },
  })

const [borrowChartId, lendChartId] = ['borrowChart', 'lendChart']

/** Columns for the lending markets table. */
export const LLAMA_MARKET_COLUMNS = [
  columnHelper.accessor('assets', {
    header: t`Collateral • Borrow`,
    cell: MarketTitleCell,
    size: ColumnWidth.lg,
  }),
  columnHelper.accessor('rates.borrow', {
    header: t`7D Avg Borrow Rate`,
    cell: (c) => <RateCell market={c.row.original} type="borrow" />,
    meta: { type: 'numeric' },
    size: ColumnWidth.sm,
  }),
  columnHelper.accessor('rates.borrow', {
    id: borrowChartId,
    header: t`7D Borrow Rate Chart`,
    cell: (c) => <LineGraphCell market={c.row.original} type="borrow" />,
    size: ColumnWidth.md,
  }),
  columnHelper.accessor('rates.lend', {
    header: t`7D Avg Supply Yield`,
    cell: (c) => <RateCell market={c.row.original} type="lend" />,
    meta: { type: 'numeric' },
    size: ColumnWidth.sm,
    sortUndefined: 'last',
  }),
  columnHelper.accessor('rates.lend', {
    id: lendChartId,
    header: t`7D Supply Yield Chart`,
    cell: (c) => <LineGraphCell market={c.row.original} type="lend" />,
    size: ColumnWidth.md,
    sortUndefined: 'last',
  }),
  columnHelper.accessor('utilizationPercent', {
    header: t`Utilization`,
    cell: UtilizationCell,
    meta: { type: 'numeric' },
    size: ColumnWidth.sm,
  }),
  columnHelper.accessor('liquidityUsd', {
    header: () => t`Available Liquidity`,
    cell: CompactUsdCell,
    meta: { type: 'numeric' },
    size: ColumnWidth.sm,
  }),
  // Following columns are used in tanstack filter, but they are displayed together in MarketTitleCell
  hidden('chain', multiFilterFn),
  hidden('assets.collateral.symbol', multiFilterFn),
  hidden('assets.borrowed.symbol', multiFilterFn),
  hidden('isFavorite', boolFilterFn),
  hidden('rewards', boolFilterFn),
  hidden('type', multiFilterFn),
] satisfies ColumnDef<LlamaMarket, any>[]

export const DEFAULT_SORT = [{ id: 'liquidityUsd', desc: true }]

export const DEFAULT_VISIBILITY: VisibilityGroup[] = [
  {
    label: t`Markets`,
    options: [
      { label: t`Available Liquidity`, id: 'liquidityUsd', active: true },
      { label: t`Utilization`, id: 'utilizationPercent', active: true },
    ],
  },
  {
    label: t`Borrow`,
    options: [{ label: t`Chart`, id: borrowChartId, active: true }],
  },
  {
    label: t`Lend`,
    options: [{ label: t`Chart`, id: lendChartId, active: true }],
  },
]
