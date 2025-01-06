import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { TableFilters, useColumnFilters } from '@ui-kit/shared/ui/TableFilters'
import { t } from '@lingui/macro'
import { CompactUsdCell, LineGraphCell, PoolTitleCell, UtilizationCell } from './cells'
import { DataTable } from '@ui-kit/shared/ui/DataTable'
import { LendingVault } from '@/entities/vaults'
import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { LendingMarketsFilters } from '@/components/PageLlamaMarkets/LendingMarketsFilters'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import { DeepKeys } from '@tanstack/table-core/build/lib/utils'
import { ColumnVisibilityGroup, useColumnSettings } from '@ui-kit/shared/ui/TableColumnVisibilityPopover'

const { ColumnWidth, Spacing, MaxWidth } = SizesAndSpaces

const columnHelper = createColumnHelper<LendingVault>()

/** Define a hidden column. */
const hidden = (id: DeepKeys<LendingVault>) =>
  columnHelper.accessor(id, {
    filterFn: (row, columnId, filterValue) => !filterValue?.length || filterValue.includes(row.getValue(columnId)),
    meta: { hidden: true },
  })

/** Columns for the lending markets table. */
const columns = [
  columnHelper.accessor('assets', {
    header: t`Collateral • Borrow`,
    cell: PoolTitleCell,
    size: ColumnWidth.lg,
  }),
  columnHelper.accessor('rates.borrowApyPcent', {
    header: t`7D Borrow Rate`,
    cell: (c) => <LineGraphCell vault={c.row.original} type="borrow" />,
    meta: { type: 'numeric' },
    size: ColumnWidth.md,
  }),
  columnHelper.accessor('rates.lendApyPcent', {
    header: t`7D Supply Yield`,
    cell: (c) => <LineGraphCell vault={c.row.original} type="lend" />,
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
] satisfies ColumnDef<LendingVault, any>[]

const DEFAULT_SORT = [{ id: 'totalSupplied.usdTotal', desc: true }]

const DEFAULT_VISIBILITY: ColumnVisibilityGroup[] = [
  {
    label: t`Markets`,
    columns: [
      { label: t`Available Liquidity`, columnId: 'totalSupplied.usdTotal', active: true },
      { label: t`Utilization`, columnId: 'utilizationPercent', active: true },
    ],
  },
  {
    label: t`Borrow`,
    columns: [
      { label: t`Collateral`, columnId: 'assets.collateral.symbol', active: true },
      // { label: t`Credit Limit`, columnId: '???', active: true },
      { label: t`Rate Chart`, columnId: 'rates.borrowApyPcent', active: true },
    ],
  },
  {
    label: t`Lend`,
    columns: [
      // { label: t`Available Liquidity`, columnId: 'totalSupplied.usdTotal', active: true },
      { label: t`Rate Chart`, columnId: 'rates.lendApyPcent', active: true },
    ],
  },
]

export const LendingMarketsTable = ({
  onReload,
  data,
  headerHeight,
}: {
  onReload: () => void
  data: LendingVault[]
  headerHeight: string
}) => {
  const [columnFilters, columnFiltersById, setColumnFilter] = useColumnFilters()
  const { columnSettings, columnVisibility, onColumnVisibilityChange, toggleColumnVisibility } =
    useColumnSettings(DEFAULT_VISIBILITY)

  const [sorting, onSortingChange] = useSortFromQueryString(DEFAULT_SORT)
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnVisibility, columnFilters },
    onSortingChange,
    onColumnVisibilityChange,
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
      <TableFilters
        title={t`Llamalend Markets`}
        subtitle={t`Select a market to view more details`}
        onReload={onReload}
        learnMoreUrl="https://docs.curve.fi/lending/overview/"
        columnVisibilityGroups={columnSettings}
        toggleColumnVisibility={toggleColumnVisibility}
      >
        <LendingMarketsFilters columnFilters={columnFiltersById} setColumnFilter={setColumnFilter} data={data} />
      </TableFilters>
      <DataTable table={table} headerHeight={headerHeight} rowHeight="3xl" emptyText={t`No markets found`} />
    </Stack>
  )
}
