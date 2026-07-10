import Grid from '@mui/material/Grid'
import { t } from '@ui-kit/lib/i18n'
import type { ExpandedPanel } from '@ui-kit/shared/ui/DataTable/ExpansionRow'
import { Metric, type MetricProps } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { constQ } from '@ui-kit/types/util'
import { decimal } from '@ui-kit/utils'
import { PoolListRewards } from '../cells/PoolListRewards'
import { PoolListColumnId } from '../columns/column.enum'
import type { PoolListItem } from '../poolList.types'
import { getPoolYieldApy } from '../poolList.utils'

const { Spacing } = SizesAndSpaces

const ListInfoItem = ({
  value,
  ...props
}: Omit<MetricProps, 'value' | 'category'> & { value: number | string | undefined | null }) => (
  <Grid size={6}>
    <Metric category="dex.poolListMobileExpanded" value={constQ(decimal(value) ?? null)} {...props} />
  </Grid>
)

const highlight = { color: 'success' as const }

export const PoolListMobileExpandedPanel: ExpandedPanel<PoolListItem> = ({ row, table }) => {
  const pool = row.original
  const hasVolume = table.getColumn(PoolListColumnId.Volume)?.getIsVisible()

  return (
    <Grid container spacing={Spacing.md}>
      {hasVolume && (
        <ListInfoItem
          label={t`24h Volume`}
          value={pool.tradingVolume24h}
          valueOptions={{
            unit: 'dollar',
            ...(table.getColumn(PoolListColumnId.Volume)?.getIsSorted() && highlight),
          }}
        />
      )}
      <ListInfoItem
        label={t`TVL`}
        value={pool.tvlUsd}
        valueOptions={{
          unit: 'dollar',
          ...(table.getColumn(PoolListColumnId.Tvl)?.getIsSorted() && highlight),
        }}
      />
      <ListInfoItem
        label={t`BASE vAPY`}
        value={getPoolYieldApy(pool.baseDailyApr)}
        valueOptions={{
          unit: 'percentage',
          ...(table.getColumn(PoolListColumnId.RewardsBase)?.getIsSorted() && highlight),
        }}
      />
      <Grid size={6}>
        <PoolListRewards pool={pool} mobile />
      </Grid>
    </Grid>
  )
}
