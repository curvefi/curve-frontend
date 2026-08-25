import { BaseApyTooltipContent } from '@/dex/components/BaseApyTooltipContent'
import { CrvApyTooltipContent } from '@/dex/components/CrvApyTooltipContent'
import { useCurrentDate } from '@evm-ui/hooks/useCurrentDate'
import { t } from '@evm-ui/lib/i18n'
import type { ExpandedPanelComponent } from '@evm-ui/shared/ui/DataTable/ExpansionRow'
import { Metric, type MetricProps } from '@evm-ui/shared/ui/Metric'
import { RewardIcon } from '@evm-ui/shared/ui/RewardIcon'
import { TokenIcon } from '@evm-ui/shared/ui/TokenIcon'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { decimal, formatCappedRateValue, formatNumber, MAINNET_CRV, relativeTime } from '@evm-ui/utils'
import { formatDate } from '@legacy-ui/utils'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import { maybe } from '@primitives/objects.utils'
import { NetApyTooltipContent } from '../cells/NetApyTooltipContent'
import { RewardIcons } from '../cells/RewardIcons'
import { RewardsApyTooltipContent } from '../cells/RewardsApyTooltipContent'
import {
  formatCrvApyRange,
  getBaseApy,
  getCrvApyRange,
  getNetApy,
  getPointsCampaigns,
  getRewardsApy,
  isVolatileApy,
} from '../cells/utils'
import { POOLS_COLUMN_OPTIONS, POOL_TITLES, PoolColumnId } from '../columns'
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

const isColumnEnabled = (variant: PoolColumnVariant, columnId: PoolColumnId) =>
  POOLS_COLUMN_OPTIONS[variant].some(({ options }) =>
    options.some(({ columns, enabled }) => enabled && columns.includes(columnId)),
  )

type PoolExpandedPanelProps = Parameters<ExpandedPanelComponent<PoolRow>>[0] & { variant: PoolColumnVariant }

export const PoolExpandedPanel = ({ row, variant }: PoolExpandedPanelProps) => {
  const pool = row.original
  const currentDate = useCurrentDate()
  const baseApy = getBaseApy(pool, 'daily')
  const weeklyBaseApy = getBaseApy(pool, 'weekly')
  const netApy = getNetApy(pool)
  const rewardsApy = getRewardsApy(pool)
  const crvApyRange = pool.gauge?.isKilled ? null : getCrvApyRange(pool)
  const pointsCampaigns = getPointsCampaigns(pool)
  const supportsNetApy = isColumnEnabled(variant, PoolColumnId.NetApy)
  const supportsVolume = isColumnEnabled(variant, PoolColumnId.Volume)
  const supportsTvl = isColumnEnabled(variant, PoolColumnId.Tvl)
  const primaryMetricCount = [supportsNetApy, supportsVolume, supportsTvl].filter(Boolean).length
  const primaryMetricSize = primaryMetricCount ? 12 / primaryMetricCount : 12
  const volatileBaseApy = isVolatileApy(baseApy)

  return (
    <Grid container spacing={Spacing.md}>
      {supportsNetApy && (
        <Grid size={primaryMetricSize}>
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
      )}
      {supportsVolume && (
        <Grid size={primaryMetricSize}>
          <Metric
            category={PRIMARY_METRIC_CATEGORY}
            label={t`24h Volume`}
            value={decimal(pool.tradingVolume24h) ?? null}
            valueOptions={{ unit: 'dollar' }}
            testId="pool-volume"
          />
        </Grid>
      )}
      {supportsTvl && (
        <Grid size={primaryMetricSize}>
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
        {isColumnEnabled(variant, PoolColumnId.BaseApy) && (
          <Metric
            category={DETAIL_METRIC_CATEGORY}
            label={POOL_TITLES[PoolColumnId.BaseApy]}
            value={baseApy || null}
            valueOptions={getRateValueOptions(baseApy, {
              hasTooltip: pool.baseDailyApr != null,
              volatile: volatileBaseApy,
            })}
            valueTooltip={maybe(pool.baseDailyApr, () => ({
              body: <BaseApyTooltipContent dailyApy={baseApy} weeklyApy={weeklyBaseApy} weekly={false} />,
              placement: 'top',
              title: t`Base APY`,
            }))}
            testId="pool-base-apy"
          />
        )}
        {isColumnEnabled(variant, PoolColumnId.WeeklyBaseApy) && (
          <Metric
            category={DETAIL_METRIC_CATEGORY}
            label={POOL_TITLES[PoolColumnId.WeeklyBaseApy]}
            value={weeklyBaseApy || null}
            valueOptions={getRateValueOptions(weeklyBaseApy, {
              hasTooltip: pool.baseWeeklyApr != null,
              volatile: isVolatileApy(weeklyBaseApy),
            })}
            valueTooltip={maybe(pool.baseWeeklyApr, () => ({
              body: <BaseApyTooltipContent dailyApy={baseApy} weeklyApy={weeklyBaseApy} weekly />,
              placement: 'top',
              title: t`Weekly Base APY`,
            }))}
            testId="pool-weekly-base-apy"
          />
        )}
        {isColumnEnabled(variant, PoolColumnId.RewardsApy) && (
          <Metric
            category={DETAIL_METRIC_CATEGORY}
            label={POOL_TITLES[PoolColumnId.RewardsApy]}
            value={rewardsApy || null}
            valueOptions={getRateValueOptions(rewardsApy)}
            valueTooltip={
              rewardsApy
                ? {
                    body: <RewardsApyTooltipContent pool={pool} />,
                    clickable: true,
                    placement: 'top',
                    title: t`Rewards APY`,
                  }
                : undefined
            }
            icon={<RewardIcons pool={pool} tooltipPlacement="top" />}
            testId="pool-rewards-apy"
          />
        )}
        {isColumnEnabled(variant, PoolColumnId.CrvApy) && (
          <Metric
            category={DETAIL_METRIC_CATEGORY}
            label={POOL_TITLES[PoolColumnId.CrvApy]}
            value={crvApyRange?.unboostedApy ?? null}
            valueOptions={{
              abbreviate: false,
              fallback: '-',
              disableTooltip: !crvApyRange,
              formatter: crvApyRange ? () => formatCrvApyRange(crvApyRange) : undefined,
            }}
            valueTooltip={
              crvApyRange
                ? {
                    body: (
                      <CrvApyTooltipContent
                        unboostedApy={crvApyRange.unboostedApy}
                        maximumApy={crvApyRange.boostedApy}
                      />
                    ),
                    placement: 'top',
                    title: t`CRV APY`,
                  }
                : undefined
            }
            icon={<TokenIcon blockchainId={MAINNET_CRV.chain} address={MAINNET_CRV.address} size="mui-sm" />}
            testId="pool-crv-apy"
          />
        )}
        {isColumnEnabled(variant, PoolColumnId.Points) &&
          pointsCampaigns.map((campaign, index) => {
            const campaignValue =
              campaign.reward?.type === 'points'
                ? formatNumber(campaign.reward.value, 'multiplier')
                : campaign.symbol || '-'

            return (
              <Link
                // eslint-disable-next-line @eslint-react/no-array-index-key -- Campaigns can have duplicate platform metadata and no stable identifier.
                key={`${campaign.platform}-${campaign.description}-${index}`}
                aria-label={t`Open ${campaign.platform} points dashboard`}
                color="inherit"
                href={campaign.dashboardLink}
                rel="noopener noreferrer"
                sx={{ display: 'block' }}
                target="_blank"
                underline="none"
              >
                <Metric
                  category={DETAIL_METRIC_CATEGORY}
                  label={t`Points`}
                  value={null}
                  valueOptions={{ disableTooltip: true, fallback: campaignValue }}
                  icon={<RewardIcon src={campaign.platformImageId} alt={campaign.platform} size="sm" />}
                  testId={`pool-points-campaign-${index}`}
                />
              </Link>
            )
          })}
        {isColumnEnabled(variant, PoolColumnId.Age) && (
          <Metric
            category={DETAIL_METRIC_CATEGORY}
            label={POOL_TITLES[PoolColumnId.Age]}
            value={pool.creationDate}
            valueOptions={{
              abbreviate: false,
              fallback: '-',
              disableTooltip: pool.creationDate == null,
              formatter: () => relativeTime(currentDate.getTime(), pool.creationDate!),
            }}
            valueTooltip={maybe(pool.creationDate, creationDate => ({
              placement: 'top',
              title: formatDate(creationDate, 'long'),
            }))}
            testId="pool-age"
          />
        )}
      </Grid>
    </Grid>
  )
}
