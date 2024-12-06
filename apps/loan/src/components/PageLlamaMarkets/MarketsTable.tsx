import Card from '@mui/material/Card'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { TableFilters } from '@ui-kit/shared/ui/TableFilters'
import { t } from '@lingui/macro'
import { useMemo } from 'react'
import { BorrowRateCell, LiquidityCell, PoolTitleCell, SupplyYieldCell, UtilizationCell } from './cells'
import { TableGrid } from '@ui-kit/shared/ui/TableGrid'
import { ExtendedPoolDataFromApi } from '@/entities/pools'

const { Spacing, MaxWidth } = SizesAndSpaces

export const MarketsTable = ({ onReload, data }: { onReload: () => void; data: ExtendedPoolDataFromApi }) => (
  <Card sx={{ paddingY: Spacing.xs, maxWidth: MaxWidth, backgroundColor: (t) => t.design.Layer[1].Fill }}>
    <TableFilters title={t`Llamalend Markets`} subtitle={t`Select a market to view more details`} onReload={onReload} />
    <TableGrid
      data={useMemo(() => data.poolData.filter((pool) => pool.coins.find((c) => c.symbol == 'crvUSD')), [data])}
      rowId={(row) => [row.blockchainId, row.registryId, row.id].join('-')}
      columns={useMemo(
        () => [
          { key: 'title', title: t`Collateral • Borrow`, component: PoolTitleCell, size: { mobile: 6, desktop: 3 } },
          { key: 'borrow', title: t`7D Borrow Rate`, component: BorrowRateCell, size: { mobile: 6, desktop: 3 } },
          { key: 'supply', title: t`7D Supply Yield`, component: SupplyYieldCell, size: { mobile: 6, desktop: 3 } },
          { key: 'utilization', title: t`Utilization`, component: UtilizationCell, size: { mobile: 3, desktop: 2 } },
          {
            key: 'liquidity',
            title: t`Available Liquidity`,
            component: LiquidityCell,
            size: { mobile: 3, desktop: 1 },
          },
        ],
        [],
      )}
    />
  </Card>
)
