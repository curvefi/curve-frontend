import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { TableFilters } from '@ui-kit/shared/ui/TableFilters'
import { t } from '@lingui/macro'
import { useMemo } from 'react'
import { BorrowRateCell, LiquidityCell, PoolTitleCell, SupplyYieldCell, UtilizationCell } from './cells'
import { TableGrid } from '@ui-kit/shared/ui/TableGrid'
import { LendingVault } from '@/entities/vaults'
import { createColumnHelper } from '@tanstack/react-table'

const { Spacing, MaxWidth } = SizesAndSpaces

const columnHelper = createColumnHelper<LendingVault>()
const columns = [
  columnHelper.accessor('assets', {
    header: t`Collateral • Borrow`,
    cell: PoolTitleCell,
  }),
  columnHelper.accessor('rates.borrowApyPcent', {
    header: t`7D Borrow Rate`,
    cell: BorrowRateCell,
  }),
  columnHelper.accessor('rates.lendApyPcent', {
    header: t`7D Supply Yield`,
    cell: SupplyYieldCell,
  }),
  columnHelper.accessor('utilizationPercent', {
    header: t`Utilization`,
    cell: UtilizationCell,
  }),
  columnHelper.accessor('totalSupplied.usdTotal', {
    header: () => t`Available Liquidity`,
    cell: LiquidityCell,
  }),
]

export const MarketsTable = ({ onReload, data }: { onReload: () => void; data: LendingVault[] }) => (
  <Stack
    sx={{
      marginBlockStart: Spacing.xl,
      marginBlockEnd: Spacing.xxl,
      maxWidth: MaxWidth.lg,
      backgroundColor: (t) => t.design.Layer[1].Fill,
    }}
  >
    <TableFilters
      title={t`Llamalend Markets`}
      subtitle={t`Select a market to view more details`}
      onReload={onReload}
      learnMoreUrl="https://docs.curve.fi/lending/overview/"
    />
    <TableGrid
      data={useMemo(() => data.filter((d) => d.usdTotal > 0).sort((a, b) => b.usdTotal - a.usdTotal), [data])}
      columns={columns}
    />
  </Stack>
)
