import Grid from '@mui/material/Grid'
import { t } from '@ui-kit/lib/i18n'
import type { ExpandedPanelComponent } from '@ui-kit/shared/ui/DataTable/ExpansionRow'
import { Metric, type MetricProps } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { aprToApy, AVERAGE_CATEGORIES, decimal } from '@ui-kit/utils'
import { RewardsCell } from '../cells/RewardsCell'
import { PoolColumnId } from '../columns/columns.enum'
import type { PoolRow } from '../types'

const { Spacing } = SizesAndSpaces

const getPoolYieldApy = (apr: number | null | undefined) =>
  aprToApy(apr, AVERAGE_CATEGORIES['dex.poolYield.compoundRate'].window)

const ListInfoItem = ({
  value,
  ...props
}: Omit<MetricProps, 'value' | 'category'> & { value: number | string | undefined | null }) => (
  <Grid size={6}>
    <Metric category="dex.poolListMobileExpanded" value={decimal(value) ?? null} {...props} />
  </Grid>
)

const highlight = { color: 'success' as const }

export const PoolExpandedPanel: ExpandedPanelComponent<PoolRow> = ({ row, table }) => {
  const pool = row.original
  const hasVolume = table.getColumn(PoolColumnId.Volume)?.getIsVisible()

  return (
    <Grid container spacing={Spacing.md}>
      {hasVolume && (
        <ListInfoItem
          label={t`24h Volume`}
          value={pool.tradingVolume24h}
          valueOptions={{
            unit: 'dollar',
            ...(table.getColumn(PoolColumnId.Volume)?.getIsSorted() && highlight),
          }}
        />
      )}
      <ListInfoItem
        label={t`TVL`}
        value={pool.tvlUsd}
        valueOptions={{
          unit: 'dollar',
          ...(table.getColumn(PoolColumnId.Tvl)?.getIsSorted() && highlight),
        }}
      />
      <ListInfoItem
        label={t`BASE vAPY`}
        value={getPoolYieldApy(pool.baseDailyApr)}
        valueOptions={{
          unit: 'percentage',
          ...(table.getColumn(PoolColumnId.RewardsBase)?.getIsSorted() && highlight),
        }}
      />
      <Grid size={6}>
        <RewardsCell pool={pool} isMobile />
      </Grid>
    </Grid>
  )
}
