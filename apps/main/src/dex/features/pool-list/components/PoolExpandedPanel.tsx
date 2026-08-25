import { useCurrentDate } from '@evm-ui/hooks/useCurrentDate'
import { t } from '@evm-ui/lib/i18n'
import type { ExpandedPanelComponent } from '@evm-ui/shared/ui/DataTable/ExpansionRow'
import { Metric, type MetricProps } from '@evm-ui/shared/ui/Metric'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { decimal, formatCappedRateValue, relativeTime } from '@evm-ui/utils'
import { formatDate } from '@legacy-ui/utils'
import Grid from '@mui/material/Grid'
import { maybe } from '@primitives/objects.utils'
import { NetApyTooltipContent } from '../cells/NetApyTooltipContent'
import { RewardIcons } from '../cells/RewardIcons'
import { getBaseApy, getNetApy, isVolatileApy } from '../cells/utils'
import { POOL_TITLES, PoolColumnId } from '../columns'
import type { PoolColumnVariant } from '../hooks/usePoolsVisibility'
import type { PoolRow } from '../types'

const { Spacing } = SizesAndSpaces
const PRIMARY_METRIC_CATEGORY = 'dex.poolListMobileExpanded'
const DETAIL_METRIC_CATEGORY = 'dex.poolListMobileExpandedDetails'

type RateValueOptions = {
  hasTooltip?: boolean
  volatile?: boolean
}

const getRateValueOptions = (
  value: number | null | undefined,
  { hasTooltip = Boolean(value), volatile = false }: RateValueOptions = {},
): MetricProps['valueOptions'] => ({
  unit: 'percentage',
  abbreviate: !volatile,
  minimumFractionDigits: 2,
  maximumSignificantDigits: undefined,
  fallback: '-',
  disableTooltip: !hasTooltip,
  ...(volatile && { color: 'error', formatter: formatCappedRateValue }),
})

type PoolExpandedPanelProps = Parameters<ExpandedPanelComponent<PoolRow>>[0] & { variant: PoolColumnVariant }

const PRIMARY_METRIC_SIZE = 6 as const

export const PoolExpandedPanel = ({ row, variant }: PoolExpandedPanelProps) => {
  const pool = row.original
  const currentDate = useCurrentDate()
  const baseApy = getBaseApy(pool, 'daily')
  const netApy = getNetApy(pool)
  const volatileBaseApy = isVolatileApy(baseApy)

  return (
    <Grid container spacing={Spacing.md}>
      <Grid size={PRIMARY_METRIC_SIZE}>
        <Metric
          category={PRIMARY_METRIC_CATEGORY}
          label={POOL_TITLES[PoolColumnId.NetApy]}
          value={netApy || null}
          valueOptions={getRateValueOptions(netApy, { volatile: volatileBaseApy })}
          valueTooltip={
            netApy
              ? {
                  body: <NetApyTooltipContent pool={pool} volatile={volatileBaseApy} />,
                  clickable: true,
                  placement: 'top',
                  title: t`Net APY`,
                }
              : undefined
          }
          icon={<RewardIcons pool={pool} includeCrv includePoints tooltipPlacement="top" />}
          testId="pool-net-apy"
        />
      </Grid>
      {variant === 'full' && (
        <Grid size={PRIMARY_METRIC_SIZE}>
          <Metric
            category={PRIMARY_METRIC_CATEGORY}
            label={t`24h Volume`}
            value={decimal(pool.tradingVolume24h) ?? null}
            valueOptions={{ unit: 'dollar' }}
            testId="pool-volume"
          />
        </Grid>
      )}
      {variant === 'lite' && (
        <Grid size={PRIMARY_METRIC_SIZE}>
          <Metric
            category={PRIMARY_METRIC_CATEGORY}
            label={t`TVL`}
            value={decimal(pool.tvlUsd) ?? null}
            valueOptions={{ unit: 'dollar' }}
            testId="pool-tvl"
          />
        </Grid>
      )}

      <Grid size={12}>
        {variant === 'full' && (
          <Metric
            category={DETAIL_METRIC_CATEGORY}
            label={POOL_TITLES[PoolColumnId.Tvl]}
            value={pool.tvlUsd}
            valueOptions={{ unit: 'dollar' }}
            testId="pool-tvl"
          />
        )}
        {maybe(pool.creationDate, creationDate => (
          <Metric
            category={DETAIL_METRIC_CATEGORY}
            label={POOL_TITLES[PoolColumnId.Age]}
            value={creationDate}
            valueOptions={{
              abbreviate: false,
              formatter: () => relativeTime(currentDate.getTime(), pool.creationDate!),
            }}
            valueTooltip={{ title: formatDate(creationDate, 'long') }}
            testId="pool-age"
          />
        ))}
      </Grid>
    </Grid>
  )
}
