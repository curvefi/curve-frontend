import type { HealthQuery } from '@/llamalend/queries/user/user-health.query'
import Grid from '@mui/material/Grid'
import { useTheme } from '@mui/material/styles'
import { mapRecord } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { mapQuery } from '@ui-kit/types/util'
import { formatNumber } from '@ui-kit/utils'
import { HEALTH_FACTOR_TOOLTIP, HEALTH_TOOLTIP, LIQUIDATION_BUFFER_TOOLTIP } from '../tooltips'
import { HealthAndBufferBar, HealthAndBufferDebug } from './HealthAndBufferBar'
import { getHealthDetailsState, getHealthColor } from './utils'

const { Spacing } = SizesAndSpaces

const HEALTH_DETAILS_COLUMNS = { mobile: 4, tablet: 6, desktop: 10 } as const
const PRIMARY_METRIC_SIZE = 2.5

const HEALTH_PRECISION_THRESHOLD = 1.1

export const HealthDetails = ({ healthQuery }: { healthQuery: HealthQuery }) => {
  const theme = useTheme()
  const { state, healthState, type } = getHealthDetailsState(healthQuery.data)

  return (
    <>
      <HealthAndBufferDebug healthQuery={healthQuery} state={state} type={type} />
      <Grid container columns={HEALTH_DETAILS_COLUMNS} columnSpacing={Spacing.xs} sx={{ alignItems: 'center' }}>
        <Grid size={PRIMARY_METRIC_SIZE}>
          <Metric
            category="llamalend.positionHealth"
            label={HEALTH_TOOLTIP.shortTitle}
            testId="health-details-health-metric"
            value={mapQuery(healthQuery, data => data.healthFactor)}
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
          <HealthAndBufferBar query={healthQuery} state={state} type="health" />
        </Grid>
        <Grid size={PRIMARY_METRIC_SIZE}>
          <Metric
            category="llamalend.positionLiquidationBuffer"
            label={LIQUIDATION_BUFFER_TOOLTIP.shortTitle}
            testId="health-details-liquidation-buffer-metric"
            value={mapQuery(healthQuery, data => data.liquidationBuffer)}
            notional={mapQuery(healthQuery, data => t`(${formatNumber(data.healthNotFull, 'percent.value')} of debt)`)}
            valueOptions={{
              abbreviate: false,
              formatter: value => formatNumber(value, 'percent.value'),
            }}
            valueTooltip={LIQUIDATION_BUFFER_TOOLTIP}
          />
        </Grid>
        <Grid
          // Liquidation buffer size is the half of the health bar
          size={mapRecord(HEALTH_DETAILS_COLUMNS, (_, size) => (size - PRIMARY_METRIC_SIZE) / 2)}
        >
          <HealthAndBufferBar query={healthQuery} state={state} type="liquidationBuffer" />
        </Grid>
      </Grid>
    </>
  )
}
