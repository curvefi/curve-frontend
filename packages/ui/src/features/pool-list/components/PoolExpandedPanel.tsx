import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatDate } from '@primitives/date.utils'
import { type Nullish, maybe } from '@primitives/objects.utils'
import { Metric, type MetricProps } from '@ui/components/Metric'
import { TokenLabel } from '@ui/components/TokenLabel'
import { AddressActionInfo, type AddressDisplay } from '@ui/features/forms/action-info/AddressActionInfo'
import { toQuery } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useCurrentDate } from '@ui/hooks/useCurrentDate'
import { decimal } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import { formatCappedRateValue } from '@ui/lib/rates.utils'
import { relativeTime } from '@ui/lib/time'
import { formatToken } from '@ui/lib/tokens'
import { ClaimablesTooltipContent } from '../cells/ClaimablesTooltipContent'
import { NetRateTooltipContent } from '../cells/NetRateTooltipContent'
import { ClaimablesIcons, RewardIcons } from '../cells/RewardIcons'
import { getBaseApr, isVolatileRate } from '../cells/utils'
import { POOL_TITLES, PoolColumnId } from '../columns'
import type { PoolRow, PoolTableMeta, PoolTableVariant } from '../types'

const { Spacing } = SizesAndSpaces
const PRIMARY_METRIC_CATEGORY = 'dex.poolListMobileExpanded'
const DETAIL_METRIC_CATEGORY = 'dex.poolListMobileExpandedDetails'

type RateValueOptions = { hasTooltip?: boolean; volatile?: boolean }

const getRateValueOptions = (
  value: number | Nullish,
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

const PRIMARY_METRIC_SIZE = { full: 6, lite: 6, userPositions: 4, residualClaims: 6 } satisfies Record<
  PoolTableVariant,
  number
>

const PoolTokens = ({ pool, addressDisplay }: { pool: PoolRow; addressDisplay: AddressDisplay }) => (
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
          display={addressDisplay}
          hideTooltip
          testId={`pool-token-${address}`}
        />
      ))}
    </Stack>
  </Stack>
)

export const PoolExpandedPanel = ({
  pool,
  variant,
  addressDisplay,
  crvToken,
}: {
  pool: PoolRow
  variant: PoolTableVariant
  addressDisplay: AddressDisplay
  crvToken: PoolTableMeta['crvToken']
}) => {
  const currentDate = useCurrentDate()
  const baseRate = getBaseApr(pool, 'daily')
  const netRate = pool.netApr
  const claimables = pool.userPosition?.claimables
  const volatileBaseRate = isVolatileRate(baseRate)

  return (
    <Grid container spacing={Spacing.md}>
      <Grid size={PRIMARY_METRIC_SIZE[variant]}>
        <Metric
          category={PRIMARY_METRIC_CATEGORY}
          label={POOL_TITLES[PoolColumnId.NetRate]}
          value={netRate || null}
          valueOptions={getRateValueOptions(netRate, { volatile: volatileBaseRate })}
          valueTooltip={
            netRate
              ? {
                  body: <NetRateTooltipContent pool={pool} crvToken={crvToken} volatile={volatileBaseRate} />,
                  clickable: true,
                  placement: 'top',
                  title: t`Net APR`,
                }
              : undefined
          }
          icon={<RewardIcons pool={pool} crvToken={crvToken} includePoints tooltipPlacement="top" />}
          testId="pool-net-rate"
        />
      </Grid>
      {variant === 'full' && (
        <Grid size={PRIMARY_METRIC_SIZE[variant]}>
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
        <Grid size={PRIMARY_METRIC_SIZE[variant]}>
          <Metric
            category={PRIMARY_METRIC_CATEGORY}
            label={t`TVL`}
            value={decimal(pool.tvlUsd) ?? null}
            valueOptions={{ unit: 'dollar' }}
            testId="pool-tvl"
          />
        </Grid>
      )}
      {variant === 'userPositions' && (
        <Grid size={PRIMARY_METRIC_SIZE[variant]}>
          <Metric
            category={PRIMARY_METRIC_CATEGORY}
            label={POOL_TITLES[PoolColumnId.Deposits]}
            value={pool.userPosition?.depositsUsd}
            valueOptions={{ unit: 'dollar' }}
            notional={toQuery(formatToken(pool.userPosition?.lpBalance, 'LP', 'balance'))}
          />
        </Grid>
      )}
      {claimables && (
        <Grid size={PRIMARY_METRIC_SIZE[variant]}>
          <Metric
            category={PRIMARY_METRIC_CATEGORY}
            label={POOL_TITLES[PoolColumnId.Claimables]}
            value={pool.userPosition?.claimablesUsd}
            valueOptions={{ unit: 'dollar' }}
            valueTooltip={
              claimables.data && {
                body: (
                  <ClaimablesTooltipContent
                    claimables={claimables.data}
                    blockchainId={pool.blockchainId}
                    totalUsd={pool.userPosition?.claimablesUsd}
                  />
                ),
                clickable: true,
                placement: 'top',
                title: POOL_TITLES[PoolColumnId.Claimables],
              }
            }
            icon={maybe(claimables.data, rewards => (
              <ClaimablesIcons claimables={rewards} blockchainId={pool.blockchainId} />
            ))}
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
        <PoolTokens pool={pool} addressDisplay={addressDisplay} />
      </Grid>
    </Grid>
  )
}
