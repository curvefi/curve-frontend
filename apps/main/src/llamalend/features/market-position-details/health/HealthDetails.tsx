import { useUserHealthValues } from '@/llamalend/queries/user/user-health.query'
import Grid from '@mui/material/Grid'
import { useTheme } from '@mui/material/styles'
import { mapRecord } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import type { UserMarketParams } from '@ui-kit/lib/model'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { mapQuery, q } from '@ui-kit/types/util'
import { formatNumber } from '@ui-kit/utils'
import { HealthAndBufferBar, HealthAndBufferDebug } from '..'
import { HEALTH_TOOLTIP, HealthTooltipContent, LIQUIDATION_BUFFER_TOOLTIP } from '../tooltips'
import { getHealthDetailsState, getHealthColor } from './utils'

const { Spacing } = SizesAndSpaces

const HEALTH_FACTOR_TOOLTIP = {
  title: t`Health factor`,
  body: <HealthTooltipContent variant="metric" />,
}

const HEALTH_DETAILS_COLUMNS = { mobile: 4, tablet: 6, desktop: 10 } as const
const PRIMARY_METRIC_SIZE = 2

export const HealthDetails = ({ params }: { params: UserMarketParams }) => {
  const theme = useTheme()
  const healthQuery = useUserHealthValues(params)
  const { state, healthState, type } = getHealthDetailsState(healthQuery.data)

  return (
    <>
      <HealthAndBufferDebug healthQuery={q(healthQuery)} state={state} type={type} />
      <Grid container columns={HEALTH_DETAILS_COLUMNS} columnSpacing={Spacing.xs} sx={{ alignItems: 'center' }}>
        <Grid size={PRIMARY_METRIC_SIZE}>
          <Metric
            category="llamalend.positionHealth"
            label={HEALTH_TOOLTIP.shortTitle}
            value={mapQuery(healthQuery, data => data.healthFactor)}
            valueOptions={{
              abbreviate: false,
              color: getHealthColor(healthState)(theme),
              formatter: value => formatNumber(value, 'health'),
            }}
            valueTooltip={HEALTH_FACTOR_TOOLTIP}
          />
        </Grid>
        <Grid size={mapRecord(HEALTH_DETAILS_COLUMNS, (_, size) => size - PRIMARY_METRIC_SIZE)}>
          <HealthAndBufferBar query={q(healthQuery)} state={state} type="health" />
        </Grid>
        <Grid size={PRIMARY_METRIC_SIZE}>
          <Metric
            category="llamalend.positionLiquidationBuffer"
            label={LIQUIDATION_BUFFER_TOOLTIP.shortTitle}
            value={mapQuery(healthQuery, data => data.liquidationBuffer)}
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
          <HealthAndBufferBar query={q(healthQuery)} state={state} type="liquidationBuffer" />
        </Grid>
      </Grid>
    </>
  )
}
