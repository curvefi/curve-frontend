import {
  formatHealth,
  getHealthBarFill,
  getHealthFeedback,
  getLiquidationBufferBarFill,
  getLiquidationBufferFeedback,
  type HealthThresholds,
  type PositionHealth,
} from '@/llamalend/health.utils'
import { formatAmount } from '@/llamalend/widgets/action-card/info-actions.helpers'
import Grid from '@mui/material/Grid'
import { useTheme } from '@mui/material/styles'
import { formatNumber } from '@primitives/number.utils'
import { mapRecord, maybe } from '@primitives/objects.utils'
import { Metric } from '@ui/components/Metric'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { HealthTooltipContent } from '../tooltips/HealthTooltipContent'
import { LIQUIDATION_BUFFER_TOOLTIP } from '../tooltips/tooltips'
import { HealthAndBufferBar } from './HealthAndBufferBar'

const { Spacing } = SizesAndSpaces

const HEALTH_DETAILS_COLUMNS = { mobile: 4, tablet: 6, desktop: 10 } as const
const PRIMARY_METRIC_SIZE = 2.5

export const HealthDetails = ({
  position,
  thresholds,
  borrowSymbol,
}: {
  position: QueryProp<PositionHealth>
  thresholds: HealthThresholds
  borrowSymbol: string | undefined
}) => {
  const { Feedback } = useTheme().design.Text.TextColors
  // the bars show no error, it is already shown in the sibling Metric component.
  // combineQueries keeps the last data next to an error, drop it so no guessed status shows
  const { isLoading } = position
  const data = position.error ? undefined : position.data
  const healthTooltip = { title: t`Health`, body: <HealthTooltipContent status={data?.status} /> }
  return (
    <Grid container columns={HEALTH_DETAILS_COLUMNS} columnSpacing={Spacing.xs} sx={{ alignItems: 'center' }}>
      <Grid size={PRIMARY_METRIC_SIZE}>
        <Metric
          category="llamalend.positionHealth"
          label={t`Health`}
          testId="health-details-health-metric"
          value={mapQuery(position, ({ health }) => health)}
          valueOptions={{
            abbreviate: false,
            color: maybe(data, data => Feedback[getHealthFeedback(data, thresholds)]),
            formatter: formatHealth,
          }}
          valueTooltip={healthTooltip}
        />
      </Grid>
      <Grid size={mapRecord(HEALTH_DETAILS_COLUMNS, (_, size) => size - PRIMARY_METRIC_SIZE)}>
        <HealthAndBufferBar
          testId="health-details-health-bar"
          size="lg"
          tooltip={healthTooltip}
          isLoading={isLoading}
          fill={maybe(data, data => getHealthBarFill(data, thresholds))}
          feedback={maybe(data, data => getHealthFeedback(data, thresholds))}
          status={data?.status}
        />
      </Grid>
      <Grid size={PRIMARY_METRIC_SIZE}>
        <Metric
          category="llamalend.positionLiquidationBuffer"
          label={t`Liq. buffer`}
          testId="health-details-liquidation-buffer-metric"
          value={mapQuery(position, ({ liquidationBuffer }) => liquidationBuffer)}
          notional={mapQuery(position, ({ liquidationBufferAmount }) =>
            formatAmount(liquidationBufferAmount, borrowSymbol),
          )}
          valueOptions={{
            abbreviate: false,
            color: maybe(data, data => Feedback[getLiquidationBufferFeedback(data, thresholds)]),
            formatter: value => formatNumber(value, 'percent.value'),
          }}
          valueTooltip={LIQUIDATION_BUFFER_TOOLTIP}
        />
      </Grid>
      <Grid
        // Liquidation buffer size is the half of the health bar
        size={mapRecord(HEALTH_DETAILS_COLUMNS, (_, size) => (size - PRIMARY_METRIC_SIZE) / 2)}
      >
        <HealthAndBufferBar
          testId="health-details-liquidation-buffer-bar"
          size="sm"
          tooltip={LIQUIDATION_BUFFER_TOOLTIP}
          isLoading={isLoading}
          fill={maybe(data, getLiquidationBufferBarFill)}
          feedback={maybe(data, data => getLiquidationBufferFeedback(data, thresholds))}
        />
      </Grid>
    </Grid>
  )
}
