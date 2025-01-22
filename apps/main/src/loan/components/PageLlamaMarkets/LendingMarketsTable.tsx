import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { TableFilters, useColumnFilters } from '@ui-kit/shared/ui/TableFilters'
import { t } from '@lingui/macro'
import { CompactUsdCell, LineGraphCell, PoolTitleCell, UtilizationCell } from './cells'
import { DataTable } from '@ui-kit/shared/ui/DataTable'
import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { LendingMarketsFilters } from '@loan/components/PageLlamaMarkets/LendingMarketsFilters'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import { DeepKeys } from '@tanstack/table-core/build/lib/utils'
import {
  isFeatureVisible,
  useVisibilitySettings,
  VisibilityGroup,
} from '@ui-kit/shared/ui/TableVisibilitySettingsPopover'
import { LlamaMarket } from '@loan/entities/llama-markets'

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
    cell: PoolTitleCell,
    size: ColumnWidth.lg,
  }),
  columnHelper.accessor('rates.borrowApyPcent', {
    header: t`7D Borrow Rate`,
    cell: (c) => <LineGraphCell market={c.row.original} type="borrow" showChart={isFeatureVisible(c, borrowChartId)} />,
    meta: { type: 'numeric' },
    size: ColumnWidth.md,
  }),
  columnHelper.accessor('rates.lendApyPcent', {
    header: t`7D Supply Yield`,
    cell: (c) => <LineGraphCell market={c.row.original} type="lend" showChart={isFeatureVisible(c, lendChartId)} />,
    meta: { type: 'numeric' },
    size: ColumnWidth.md,
  }),
  columnHelper.accessor('utilizationPercent', {
    header: t`Utilization`,
    cell: UtilizationCell,
    meta: { type: 'numeric' },
    size: ColumnWidth.sm,
  }),
  columnHelper.accessor('totalSupplied.usdTotal', {
    header: () => t`Available Liquidity`,
    cell: CompactUsdCell,
    meta: { type: 'numeric' },
    size: ColumnWidth.sm,
  }),
  // following columns are used to configure and filter tanstack, but they are displayed together in PoolTitleCell
  hidden('blockchainId'),
  hidden('assets.collateral.symbol'),
  hidden('assets.borrowed.symbol'),
] satisfies ColumnDef<LlamaMarket, any>[]

const DEFAULT_SORT = [{ id: 'totalSupplied.usdTotal', desc: true }]

const DEFAULT_VISIBILITY: VisibilityGroup[] = [
  {
    label: t`Markets`,
    options: [
      { label: t`Available Liquidity`, id: 'totalSupplied.usdTotal', active: true, type: 'column' },
      { label: t`Utilization`, id: 'utilizationPercent', active: true, type: 'column' },
    ],
  },
  {
    label: t`Borrow`,
    options: [{ label: t`Chart`, id: borrowChartId, active: true, type: 'feature' }],
  },
  {
    label: t`Lend`,
    options: [{ label: t`Chart`, id: lendChartId, active: true, type: 'feature' }],
  },
]

export const LendingMarketsTable = ({
  onReload,
  data,
  headerHeight,
}: {
  onReload: () => void
  data: LlamaMarket[]
  headerHeight: string
}) => {
  const [columnFilters, columnFiltersById, setColumnFilter] = useColumnFilters()
  const { columnSettings, columnVisibility, featureVisibility, toggleVisibility } =
    useVisibilitySettings(DEFAULT_VISIBILITY)

  const [sorting, onSortingChange] = useSortFromQueryString(DEFAULT_SORT)
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnVisibility, featureVisibility, columnFilters },
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
      <DataTable table={table} headerHeight={headerHeight} rowHeight="3xl" emptyText={t`No markets found`}>
        <TableFilters
          title={t`Llamalend Markets`}
          subtitle={t`Select a market to view more details`}
          onReload={onReload}
          learnMoreUrl="https://docs.curve.fi/lending/overview/"
          visibilityGroups={columnSettings}
          toggleVisibility={toggleVisibility}
        >
          <LendingMarketsFilters columnFilters={columnFiltersById} setColumnFilter={setColumnFilter} data={data} />
        </TableFilters>
      </DataTable>
    </Stack>
  )
}
