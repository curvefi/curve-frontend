import Card from '@mui/material/Card'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { TableFilters } from '@ui-kit/shared/ui/TableFilters'
import { t } from '@lingui/macro'
import { useMemo } from 'react'
import { BorrowRateCell, LiquidityCell, PoolTitleCell, SupplyYieldCell, UtilizationCell } from './cells'
import { TableGrid } from '@ui-kit/shared/ui/TableGrid'
import { LendingVaultFromApi } from '@/entities/vaults'

const { Spacing, MaxWidth } = SizesAndSpaces

export const MarketsTable = ({ onReload, data }: { onReload: () => void; data: LendingVaultFromApi[] }) => (
  <Card
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
      rowId={(row) => [row.blockchainId, row.registryId, row.id].join('-')}
      columns={useMemo(
        () => [
          {
            key: 'title',
            title: t`Collateral • Borrow`,
            component: PoolTitleCell,
            size: { mobile: 12, tablet: 6, desktop: 3 },
          },
          {
            key: 'borrow',
            title: t`7D Borrow Rate`,
            component: BorrowRateCell,
            size: { mobile: 6, tablet: 6, desktop: 3 },
          },
          {
            key: 'supply',
            title: t`7D Supply Yield`,
            component: SupplyYieldCell,
            size: { mobile: 6, tablet: 6, desktop: 3 },
          },
          {
            key: 'utilization',
            title: t`Utilization`,
            component: UtilizationCell,
            size: { mobile: 6, tablet: 3, desktop: 2 },
          },
          {
            key: 'liquidity',
            title: t`Available Liquidity`,
            component: LiquidityCell,
            size: { mobile: 6, tablet: 3, desktop: 1 },
          },
        ],
        [],
      )}
    />
  </Card>
)
