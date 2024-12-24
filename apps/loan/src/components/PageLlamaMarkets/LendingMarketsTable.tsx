import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { TableFilters } from '@ui-kit/shared/ui/TableFilters'
import { t } from '@lingui/macro'
import { useMemo } from 'react'
import { BorrowRateCell, LiquidityCell, PoolTitleCell, SupplyYieldCell, UtilizationCell } from './cells'
import { DataTable } from '@ui-kit/shared/ui/DataTable'
import { LendingVault } from '@/entities/vaults'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'

const { Spacing, MinWidth, MaxWidth } = SizesAndSpaces

const columnHelper = createColumnHelper<LendingVault>()
const columns = [
  columnHelper.accessor('assets', {
    header: t`Collateral • Borrow`,
    cell: PoolTitleCell,
  }),
  columnHelper.accessor('rates.borrowApyPcent', {
    header: t`7D Borrow Rate`,
    cell: BorrowRateCell,
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor('rates.lendApyPcent', {
    header: t`7D Supply Yield`,
    cell: SupplyYieldCell,
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor('utilizationPercent', {
    header: t`Utilization`,
    cell: UtilizationCell,
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor('totalSupplied.usdTotal', {
    header: () => t`Available Liquidity`,
    cell: LiquidityCell,
    meta: { type: 'numeric' },
  }),
] satisfies ColumnDef<LendingVault, any>[]

export const LendingMarketsTable = ({
  onReload,
  data,
  headerHeight,
}: {
  onReload: () => void
  data: LendingVault[]
  headerHeight: string
}) => (
  <Stack
    sx={{
      marginBlockStart: Spacing.xl,
      marginBlockEnd: Spacing.xxl,
      maxWidth: MaxWidth.table,
      minWidth: MinWidth.table,
      width: '100%',
      backgroundColor: (t) => t.design.Layer[1].Fill,
    }}
  >
    <TableFilters
      title={t`Llamalend Markets`}
      subtitle={t`Select a market to view more details`}
      onReload={onReload}
      learnMoreUrl="https://docs.curve.fi/lending/overview/"
    />
    <DataTable
      data={useMemo(() => data.filter((d) => d.usdTotal > 0).sort((a, b) => b.usdTotal - a.usdTotal), [data])}
      defaultSort={[{ id: 'totalSupplied.usdTotal', desc: true }]}
      columns={columns}
      headerHeight={headerHeight}
    />
  </Stack>
)
