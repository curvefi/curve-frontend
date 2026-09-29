import { use } from 'react'
import { MarketContext, useMarketContext } from '@/llamalend/features/market-context'
import type { UserPositionStatus } from '@/llamalend/llamalend.types'
import { getMarketAssetsType } from '@/llamalend/market-assets-type.utils'
import { useMarketOraclePrice } from '@/llamalend/queries/market'
import { useUserState } from '@/llamalend/queries/user'
import { useUserHealth, type HealthQuery } from '@/llamalend/queries/user/user-health.query'
import { useUserPrices } from '@/llamalend/queries/user/user-prices.query'
import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import { mapRecord } from '@primitives/objects.utils'
import { Badge } from '@ui/components/Badge'
import { Metric } from '@ui/components/Metric'
import { Tooltip } from '@ui/components/Tooltip'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery, q, type Query, type QueryProp } from '@ui/features/queries/util'
import type { ChipColors } from '@ui/features/themes/components/chip/colors'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { decimal } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import {
  bufferAmount,
  formatOracleHealth,
  formatSignedAmount,
  formatSignedPercent,
  oracleHealth,
} from '../position-metrics.utils'
import {
  isCriticalBuffer,
  PROVISIONAL_POSITION_THRESHOLDS,
  resolvePositionStatus,
  type PositionSeverity,
} from '../position-status.utils'
import { bufferTooltip, healthTooltip, statusTooltip } from '../PositionMetricTooltip'
import { HEALTH_FACTOR_TOOLTIP, HEALTH_TOOLTIP, LIQUIDATION_BUFFER_TOOLTIP } from '../tooltips'
import { HealthAndBufferBar, HealthAndBufferDebug } from './HealthAndBufferBar'
import { getHealthDetailsState, getHealthTextColor, getLiquidationBufferTextColor } from './utils'

const { Spacing } = SizesAndSpaces

/** A failed refetch keeps the previous payload. Show that payload instead of replacing it with an error icon. */
const keepDisplayedValue = <T,>(query: Query<T>) =>
  q(query.data != null && query.error != null ? { data: query.data, isLoading: query.isLoading, error: null } : query)

const HEALTH_DETAILS_COLUMNS = { mobile: 4, tablet: 6, desktop: 10 } as const
const PRIMARY_METRIC_SIZE = 2.5

const HEALTH_PRECISION_THRESHOLD = 1.1

export const HealthDetails = ({
  health,
  positionStatus,
}: {
  health: HealthQuery
  positionStatus: QueryProp<UserPositionStatus>
}) => {
  const beta = useNewLlamalendHealth()
  const theme = useTheme()
  const market = use(MarketContext)
  if (beta && market) return <BetaHealthDetails />
  const { state, healthState, liquidationBufferState, type } = getHealthDetailsState(health.data)

  return (
    <>
      <HealthAndBufferDebug healthQuery={health} state={state} type={type} />
      <Grid container columns={HEALTH_DETAILS_COLUMNS} columnSpacing={Spacing.xs} sx={{ alignItems: 'center' }}>
        <Grid size={PRIMARY_METRIC_SIZE}>
          <Metric
            category="llamalend.positionHealth"
            label={HEALTH_TOOLTIP.shortTitle}
            testId="health-details-health-metric"
            value={mapQuery(health, data => data.healthFactor)}
            valueOptions={{
              abbreviate: false,
              color: getHealthTextColor(healthState)(theme),
              formatter: value =>
                formatNumber(value, +value < HEALTH_PRECISION_THRESHOLD ? 'health.precise' : 'health'),
            }}
            valueTooltip={HEALTH_FACTOR_TOOLTIP}
          />
        </Grid>
        <Grid size={mapRecord(HEALTH_DETAILS_COLUMNS, (_, size) => size - PRIMARY_METRIC_SIZE)}>
          <HealthAndBufferBar health={health} positionStatus={positionStatus} type="health" />
        </Grid>
        <Grid size={PRIMARY_METRIC_SIZE}>
          <Metric
            category="llamalend.positionLiquidationBuffer"
            label={LIQUIDATION_BUFFER_TOOLTIP.shortTitle}
            testId="health-details-liquidation-buffer-metric"
            value={mapQuery(health, data => data.liquidationBuffer)}
            notional={mapQuery(health, data => t`(${formatNumber(data.healthNotFull, 'percent.value')} of debt)`)}
            valueOptions={{
              abbreviate: false,
              color: getLiquidationBufferTextColor(liquidationBufferState)(theme),
              formatter: value => formatNumber(value, 'percent.value'),
            }}
            valueTooltip={LIQUIDATION_BUFFER_TOOLTIP}
          />
        </Grid>
        <Grid
          // Liquidation buffer size is the half of the health bar
          size={mapRecord(HEALTH_DETAILS_COLUMNS, (_, size) => (size - PRIMARY_METRIC_SIZE) / 2)}
        >
          <HealthAndBufferBar health={health} positionStatus={positionStatus} type="liquidationBuffer" />
        </Grid>
      </Grid>
    </>
  )
}

const STATUS_BADGE_COLOR: Record<PositionSeverity, ChipColors> = {
  near: 'warning',
  inRange: 'warning',
  below: 'warning',
  liquidatable: 'alert',
  neutral: 'default',
}

/** Beta card content. Full health is the same Controller health(full) read the rest of the market uses. */
const BetaHealthDetails = () => {
  const { chainId, marketId, userAddress, controllerAddress, tokens } = useMarketContext()
  const isMobile = useIsMobile()
  const params = { chainId, marketId, userAddress }
  const oracle = useMarketOraclePrice(params)
  const userPrices = useUserPrices(params)
  const userState = useUserState(params)
  const fullHealth = useUserHealth({ ...params, isFull: true })
  const healthValue = combineQueries([oracle, userPrices], (price, prices) =>
    prices ? oracleHealth(price, prices[1]) : undefined,
  )
  const bufferValue = mapQuery(fullHealth, value => value)
  const bufferAmountValue = combineQueries([fullHealth, userState], (healthPoints, state) => {
    if (!healthPoints) return undefined
    const amount = bufferAmount(state.debt, healthPoints)
    const text = formatSignedAmount(amount)
    const display =
      text.startsWith('<') || text.startsWith('−<') || text === '0.00'
        ? text
        : formatNumber(amount, { abbreviate: true })
    return `${display} ${tokens.borrowToken?.symbol ?? ''}`
  })
  const theme = useTheme()
  const status =
    oracle.data && userPrices.data && userState.data
      ? resolvePositionStatus({
          oraclePrice: oracle.data,
          upperPrice: userPrices.data[1],
          lowerPrice: userPrices.data[0],
          fullHealth: fullHealth.data,
          debt: userState.data.debt,
          liquidationPredicate: 'strict-negative',
          assetsType: getMarketAssetsType(chainId, controllerAddress),
        })
      : undefined
  const assetsType = getMarketAssetsType(chainId, controllerAddress)
  const assetsThresholds = assetsType ? PROVISIONAL_POSITION_THRESHOLDS[assetsType] : undefined
  const bufferIsRed = isCriticalBuffer(fullHealth.data, assetsType)
  const bufferColor = bufferIsRed ? theme.design.Text.TextColors.Feedback.Error : undefined
  return (
    <>
      <Box sx={{ gridArea: 'health' }} data-testid="beta-health-details">
        <Metric
          category="llamalend.legacyPositionHealth"
          label={t`Health`}
          testId="health-details-health-metric"
          value={keepDisplayedValue(healthValue)}
          valueOptions={{
            abbreviate: false,
            formatter: value => {
              const parsed = decimal(value)
              return parsed == undefined ? '' : formatOracleHealth(parsed)
            },
          }}
          valueTooltip={healthTooltip()}
        />
        {status && (
          <Tooltip
            {...statusTooltip({
              label: status.label,
              category: assetsType,
              nearRange: assetsThresholds ? `${assetsThresholds.nearRangeDropPercent}%` : undefined,
              criticalBuffer: `${assetsThresholds?.criticalBufferPercent ?? '0'}%`,
              predicate: 'strict-negative',
              observedAt: fullHealth.dataUpdatedAt > 0 ? fullHealth.dataUpdatedAt : undefined,
            })}
          >
            <Box sx={{ mt: Spacing.xxs, width: 'fit-content' }} data-testid="position-status">
              <Badge
                data-testid="position-status-label"
                size="extraSmall"
                color={STATUS_BADGE_COLOR[status.severity]}
                label={status.label}
              />
            </Box>
          </Tooltip>
        )}
      </Box>
      <Box sx={{ gridArea: 'buffer' }}>
        <Metric
          category="llamalend.positionCardTop"
          label={t`Liquidation buffer`}
          testId="health-details-liquidation-buffer-metric"
          value={keepDisplayedValue(bufferValue)}
          notional={isMobile ? undefined : keepDisplayedValue(bufferAmountValue)}
          valueOptions={{
            abbreviate: false,
            color: bufferColor,
            ...(isMobile ? { unit: { symbol: '\u00a0of debt', position: 'suffix' as const } } : {}),
            formatter: value => {
              const parsed = decimal(value)
              return parsed == undefined ? '' : formatSignedPercent(parsed)
            },
          }}
          valueTooltip={bufferTooltip({
            predicate: 'strict-negative',
            criticalBuffer: assetsThresholds?.criticalBufferPercent ?? '0',
          })}
        />
        {status?.bufferUnavailable && (
          <Typography
            variant="bodyXsRegular"
            color="textSecondary"
            data-testid="buffer-unavailable"
          >{t`Buffer unavailable`}</Typography>
        )}
      </Box>
    </>
  )
}
