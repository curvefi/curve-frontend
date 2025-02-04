import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { TableFilters, useColumnFilters } from '@ui-kit/shared/ui/TableFilters'
import { t } from '@lingui/macro'
import { CompactUsdCell, LineGraphCell, MarketTitleCell, RateCell, UtilizationCell } from './cells'
import { DataTable } from '@ui-kit/shared/ui/DataTable'
import { LlamaMarket } from '@/loan/entities/llama-markets'
import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { LendingMarketsFilters } from '@/loan/components/PageLlamaMarkets/LendingMarketsFilters'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import { DeepKeys } from '@tanstack/table-core/build/lib/utils'
import { useVisibilitySettings, VisibilityGroup } from '@ui-kit/shared/ui/TableVisibilitySettingsPopover'
import Chip from '@mui/material/Chip'
import { FavoriteHeartIcon, HeartIcon } from '@ui-kit/shared/icons/HeartIcon'
import { PointsIcon } from '@ui-kit/shared/icons/PointsIcon'
import { MarketsFilterChips } from '@/loan/components/PageLlamaMarkets/MarketsFilterChips'

const { ColumnWidth, Spacing, MaxWidth } = SizesAndSpaces

const columnHelper = createColumnHelper<LlamaMarket>()

/** Define a hidden column. */
const hidden = (id: DeepKeys<LlamaMarket>) =>
  columnHelper.accessor(id, {
    filterFn: (row, columnId, filterValue) => !filterValue?.length || filterValue.includes(row.getValue(columnId)),
    meta: { hidden: true },
  })

const [borrowChartId, lendChartId] = ['borrowChart', 'lendChart']

/** Columns for the lending markets table. */
const columns = [
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
    enableSorting: false,
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
    enableSorting: false,
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
  hidden('chain'),
  hidden('assets.collateral.symbol'),
  hidden('assets.borrowed.symbol'),
  hidden('isFavorite'),
  hidden('hasPoints'),
] satisfies ColumnDef<LlamaMarket, any>[]

const DEFAULT_SORT = [{ id: 'liquidityUsd', desc: true }]

const DEFAULT_VISIBILITY: VisibilityGroup[] = [
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

export const LendingMarketsTable = ({
  onReload,
  data,
  headerHeight,
  isError,
}: {
  onReload: () => void
  data: LlamaMarket[]
  headerHeight: string
  isError: boolean
}) => {
  const [columnFilters, columnFiltersById, setColumnFilter] = useColumnFilters()
  const { columnSettings, columnVisibility, toggleVisibility } = useVisibilitySettings(DEFAULT_VISIBILITY)

  const [sorting, onSortingChange] = useSortFromQueryString(DEFAULT_SORT)
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnVisibility, columnFilters },
    onSortingChange,
    maxMultiSortColCount: 3, // allow 3 columns to be sorted at once
  })

  return (
    <Stack
      sx={{
        marginBlockStart: Spacing.xl,
        marginBlockEnd: Spacing.xxl,
        maxWidth: MaxWidth.table,
      }}
    >
      <DataTable
        table={table}
        headerHeight={headerHeight}
        rowHeight="3xl"
        emptyText={isError ? t`Could not load markets` : t`No markets found`}
      >
        <TableFilters
          title={t`Llamalend Markets`}
          subtitle={t`Select a market to view more details`}
          onReload={onReload}
          learnMoreUrl="https://docs.curve.fi/lending/overview/"
          visibilityGroups={columnSettings}
          toggleVisibility={toggleVisibility}
          collapsible={
            <LendingMarketsFilters columnFilters={columnFiltersById} setColumnFilter={setColumnFilter} data={data} />
          }
        >
          <MarketsFilterChips columnFiltersById={columnFiltersById} setColumnFilter={setColumnFilter} />
        </TableFilters>
      </DataTable>
    </Stack>
  )
}
