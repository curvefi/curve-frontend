import type { UserPositionStatus } from '@/llamalend/llamalend.types'
import type { HealthQuery } from '@/llamalend/queries/user/user-health.query'
import { Metric } from '@evm-ui/shared/ui/Metric'
import Grid from '@mui/material/Grid'
import { useTheme } from '@mui/material/styles'
import { formatNumber } from '@primitives/number.utils'
import { mapRecord } from '@primitives/objects.utils'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { HEALTH_FACTOR_TOOLTIP, HEALTH_TOOLTIP, LIQUIDATION_BUFFER_TOOLTIP } from '../tooltips'
import { HealthAndBufferBar, HealthAndBufferDebug } from './HealthAndBufferBar'
import { getHealthDetailsState, getHealthColor } from './utils'

const { Spacing } = SizesAndSpaces

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
  const theme = useTheme()
  const { state, healthState, type } = getHealthDetailsState(health.data)

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
              color: getHealthColor(healthState)(theme),
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
            valueOptions={{ abbreviate: false, formatter: value => formatNumber(value, 'percent.value') }}
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
