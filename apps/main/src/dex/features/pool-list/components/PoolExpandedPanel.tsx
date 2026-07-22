import type { ReactNode } from 'react'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import type { ExpandedPanelComponent } from '@ui-kit/shared/ui/DataTable/ExpansionRow'
import { Metric, type MetricProps } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { constQ } from '@ui-kit/types/util'
import { decimal } from '@ui-kit/utils'
import { BaseApyValue, WeeklyBaseApyValue } from '../cells/BaseApyCell'
import { CreationDateValue } from '../cells/CreationDateCell'
import { GaugeApyValue } from '../cells/GaugeApyCell'
import { NetApyValue } from '../cells/NetApyCell'
import { PointsValue } from '../cells/PointsCell'
import { RewardsApyValue } from '../cells/RewardsApyCell'
import { POOLS_COLUMN_OPTIONS, POOL_TITLES, PoolColumnId } from '../columns'
import type { PoolColumnVariant } from '../hooks/usePoolsVisibility'
import type { PoolRow } from '../types'

const { Spacing } = SizesAndSpaces
const EXPANDED_VALUE_VARIANT = 'highlightL' as const

const ListInfoItem = ({
  value,
  ...props
}: Omit<MetricProps, 'value' | 'category'> & { value: number | string | undefined | null }) => (
  <Grid size={6}>
    <Metric category="dex.poolListMobileExpanded" value={constQ(decimal(value) ?? null)} {...props} />
  </Grid>
)

const RewardInfoItem = ({ label, children }: { label: string; children: ReactNode }) => (
  <Grid size={6}>
    <Stack sx={{ alignItems: 'start' }}>
      <Typography variant="bodyXsRegular" color="textTertiary">
        {label}
      </Typography>
      {children}
    </Stack>
  </Grid>
)

const highlight = { color: 'success' as const }

const isColumnEnabled = (variant: PoolColumnVariant, columnId: PoolColumnId) =>
  POOLS_COLUMN_OPTIONS[variant].some(({ options }) =>
    options.some(({ columns, enabled }) => enabled && columns.includes(columnId)),
  )

type PoolExpandedPanelProps = Parameters<ExpandedPanelComponent<PoolRow>>[0] & { variant: PoolColumnVariant }

export const PoolExpandedPanel = ({ row, table, variant }: PoolExpandedPanelProps) => {
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
      {isColumnEnabled(variant, PoolColumnId.CreationDate) && (
        <RewardInfoItem label={POOL_TITLES[PoolColumnId.CreationDate]}>
          <CreationDateValue
            creationDate={pool.creationDate}
            textAlign="start"
            typographyVariant={EXPANDED_VALUE_VARIANT}
          />
        </RewardInfoItem>
      )}
      {isColumnEnabled(variant, PoolColumnId.NetApy) && (
        <RewardInfoItem label={POOL_TITLES[PoolColumnId.NetApy]}>
          <NetApyValue pool={pool} textAlign="start" typographyVariant={EXPANDED_VALUE_VARIANT} />
        </RewardInfoItem>
      )}
      {isColumnEnabled(variant, PoolColumnId.RewardsApy) && (
        <RewardInfoItem label={POOL_TITLES[PoolColumnId.RewardsApy]}>
          <RewardsApyValue
            pool={pool}
            textAlign="start"
            tooltipPlacement="top"
            typographyVariant={EXPANDED_VALUE_VARIANT}
          />
        </RewardInfoItem>
      )}
      {isColumnEnabled(variant, PoolColumnId.BaseApy) && (
        <RewardInfoItem label={POOL_TITLES[PoolColumnId.BaseApy]}>
          <BaseApyValue
            pool={pool}
            textAlign="start"
            tooltipPlacement="top"
            typographyVariant={EXPANDED_VALUE_VARIANT}
          />
        </RewardInfoItem>
      )}
      {isColumnEnabled(variant, PoolColumnId.WeeklyBaseApy) && (
        <RewardInfoItem label={POOL_TITLES[PoolColumnId.WeeklyBaseApy]}>
          <WeeklyBaseApyValue
            pool={pool}
            textAlign="start"
            tooltipPlacement="top"
            typographyVariant={EXPANDED_VALUE_VARIANT}
          />
        </RewardInfoItem>
      )}
      {isColumnEnabled(variant, PoolColumnId.GaugeApy) && (
        <RewardInfoItem label={POOL_TITLES[PoolColumnId.GaugeApy]}>
          <GaugeApyValue
            pool={pool}
            textAlign="start"
            tooltipPlacement="top"
            typographyVariant={EXPANDED_VALUE_VARIANT}
          />
        </RewardInfoItem>
      )}
      {isColumnEnabled(variant, PoolColumnId.Points) && (
        <RewardInfoItem label={POOL_TITLES[PoolColumnId.Points]}>
          <PointsValue
            pool={pool}
            textAlign="start"
            tooltipPlacement="top"
            typographyVariant={EXPANDED_VALUE_VARIANT}
          />
        </RewardInfoItem>
      )}
    </Grid>
  )
}
