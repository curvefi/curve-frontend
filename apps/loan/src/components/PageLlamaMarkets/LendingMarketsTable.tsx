import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { TableFilters } from '@ui-kit/shared/ui/TableFilters'
import { t } from '@lingui/macro'
import { useMemo, useState } from 'react'
import { CompactUsdCell, PoolTitleCell, LineGraphCell, UtilizationCell } from './cells'
import { DataTable } from '@ui-kit/shared/ui/DataTable'
import { LendingVault } from '@/entities/vaults'
import {
  ColumnDef,
  ColumnFiltersState,
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { LendingMarketsFilters } from '@/components/PageLlamaMarkets/LendingMarketsFilters'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import { FilterMeta, Row } from '@tanstack/table-core/src/types'

const { ColumnWidth, Spacing, MinWidth, MaxWidth } = SizesAndSpaces

const columnHelper = createColumnHelper<LendingVault>()
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
  // hidden columns
  columnHelper.accessor('blockchainId', {
    filterFn: (row, columnId, filterValue) => !filterValue?.length || filterValue.includes(row.getValue(columnId)),
    meta: { hidden: true },
  }),
] satisfies ColumnDef<LendingVault, any>[]

const DEFAULT_SORT = [{ id: 'totalSupplied.usdTotal', desc: true }]

export const LendingMarketsTable = ({
  onReload,
  data: sourceData,
  headerHeight,
}: {
  onReload: () => void
  data: LendingVault[]
  headerHeight: string
}) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const data = useMemo(
    () => sourceData.filter((d) => d.usdTotal > 0).sort((a, b) => b.usdTotal - a.usdTotal),
    [sourceData],
  )

  const [sorting, onSortingChange] = useSortFromQueryString(DEFAULT_SORT)
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnFilters },
    onSortingChange,
    maxMultiSortColCount: 3, // allow 3 columns to be sorted at once
  })

  return (
    <Stack
      sx={{
        marginBlockStart: Spacing.xl,
        marginBlockEnd: Spacing.xxl,
        maxWidth: MaxWidth.table,
        minWidth: MinWidth.table,
        backgroundColor: (t) => t.design.Layer[1].Fill,
      }}
    >
      <TableFilters
        title={t`Llamalend Markets`}
        subtitle={t`Select a market to view more details`}
        onReload={onReload}
        learnMoreUrl="https://docs.curve.fi/lending/overview/"
      >
        <LendingMarketsFilters columnFilters={columnFilters} setColumnFilters={setColumnFilters} data={data} />
      </TableFilters>
      <DataTable table={table} headerHeight={headerHeight} rowHeight={'3xl'} />
    </Stack>
  )
}
