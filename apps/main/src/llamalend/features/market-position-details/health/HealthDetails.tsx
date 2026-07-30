import { useUserHealthValues } from '@/llamalend/queries/user/user-health.query'
import Grid from '@mui/material/Grid'
import { useTheme } from '@mui/material/styles'
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

export const HealthDetails = ({ params }: { params: UserMarketParams }) => {
  const theme = useTheme()
  const healthQuery = useUserHealthValues(params)
  const { state, healthState, type } = getHealthDetailsState(healthQuery.data)

  return (
    <>
      <HealthAndBufferDebug healthQuery={q(healthQuery)} state={state} type={type} />
      <Grid container columns={5} columnSpacing={Spacing.xs} rowSpacing={Spacing.xxs} sx={{ alignItems: 'end' }}>
        <Grid size={1}>
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
        <Grid size={4}>
          <HealthAndBufferBar query={q(healthQuery)} state={state} type="health" />
        </Grid>
        <Grid size={1}>
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
        <Grid size={2}>
          <HealthAndBufferBar query={q(healthQuery)} state={state} type="liquidationBuffer" />
        </Grid>
      </Grid>
    </>
  )
}
