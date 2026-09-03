import { useCurrentDate } from '@evm-ui/hooks/useCurrentDate'
import { t } from '@evm-ui/lib/i18n'
import { AddressActionInfo } from '@evm-ui/shared/ui/AddressActionInfo'
import type { ExpandedPanelComponent } from '@evm-ui/shared/ui/DataTable/ExpansionRow'
import { Metric, type MetricProps } from '@evm-ui/shared/ui/Metric'
import { TokenLabel } from '@evm-ui/shared/ui/TokenLabel'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { decimal, formatCappedRateValue, relativeTime } from '@evm-ui/utils'
import { formatDate } from '@legacy-ui/utils'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { maybe } from '@primitives/objects.utils'
import { NetRateTooltipContent } from '../cells/NetRateTooltipContent'
import { RewardIcons } from '../cells/RewardIcons'
import { getBaseApr, getNetApy, isVolatileRate } from '../cells/utils'
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

const PoolTokens = ({ pool }: { pool: PoolRow }) => (
  <Stack data-testid="pool-tokens" sx={{ marginBlockStart: Spacing.md, gap: Spacing.sm }}>
    <Typography variant="bodyMBold" color="textSecondary">
      {t`Pool tokens`}
    </Typography>

    <Stack sx={{ gap: Spacing.xs }}>
      {pool.tradeableCoins.map(({ address, symbol }) => (
        <AddressActionInfo
          key={address}
          chainId={pool.chainId}
          title={
            <TokenLabel
              blockchainId={pool.blockchainId}
              address={address}
              label={symbol}
              size="mui-md"
              typographyVariant="bodyMRegular"
            />
          }
          address={address}
          hideTooltip
          testId={`pool-token-${address}`}
        />
      ))}
    </Stack>
  </Stack>
)

export const PoolExpandedPanel = ({ row, variant }: PoolExpandedPanelProps) => {
  const pool = row.original
  const currentDate = useCurrentDate()
  const baseApr = getBaseApr(pool, 'daily')
  const netApy = getNetApy(pool)
  const volatileBaseApr = isVolatileRate(baseApr)

  return (
    <Grid container spacing={Spacing.md}>
      <Grid size={PRIMARY_METRIC_SIZE}>
        <Metric
          category={PRIMARY_METRIC_CATEGORY}
          label={POOL_TITLES[PoolColumnId.NetApy]}
          value={netApy || null}
          valueOptions={getRateValueOptions(netApy, { volatile: volatileBaseApr })}
          valueTooltip={
            netApy
              ? {
                  body: <NetRateTooltipContent pool={pool} volatile={volatileBaseApr} />,
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
        <PoolTokens pool={pool} />
      </Grid>
    </Grid>
  )
}
