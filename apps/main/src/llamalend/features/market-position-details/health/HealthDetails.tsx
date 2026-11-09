import {
  formatHealth,
  getHealthFeedback,
  getLiquidationBufferFeedback,
  type HealthThresholds,
  type PositionHealth,
  type PositionStatus,
} from '@/llamalend/health.utils'
import { formatAmount } from '@/llamalend/widgets/action-card/info-actions.helpers'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { formatNumber } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import { Badge, type BadgeProps } from '@ui/components/Badge'
import { Metric } from '@ui/components/Metric'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { HealthTooltipContent } from '../tooltips/HealthTooltipContent'
import { LiquidationBufferTooltipContent } from '../tooltips/LiquidationBufferTooltipContent'

const { Spacing } = SizesAndSpaces

const POSITION_STATUS_BADGE = {
  liquidatable: { label: t`Liquidatable`, color: 'alert' },
  inRange: { label: t`Soft liquidation`, color: 'warning' },
  belowRange: { label: t`Below range`, color: 'warning' },
  nearRange: { label: t`Near range`, color: 'warning' },
  aboveRange: { label: t`Above range`, color: 'default' },
} as const satisfies Record<PositionStatus, Pick<BadgeProps, 'label' | 'color'>>

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
  // combineQueries keeps the last data next to an error, drop it so no guessed status or colour shows
  const data = position.error ? undefined : position.data
  return (
    <MetricsGrid>
      <Stack sx={{ alignItems: 'start', gap: Spacing.xs }}>
        <Metric
          category="llamalend.positionHealth"
          label={t`Health`}
          labelTooltip={{ title: t`Health`, body: <HealthTooltipContent status={data?.status} /> }}
          testId="health-details-health-metric"
          value={mapQuery(position, ({ health }) => health)}
          valueOptions={{
            abbreviate: false,
            color: maybe(data, data => Feedback[getHealthFeedback(data, thresholds)]),
            formatter: formatHealth,
          }}
        />
        {data && (
          <Badge data-testid="health-details-status-badge" size="extraSmall" {...POSITION_STATUS_BADGE[data.status]} />
        )}
      </Stack>
      <Metric
        category="llamalend.positionLiquidationBuffer"
        label={t`Liquidation buffer`}
        labelTooltip={{
          title: t`Liquidation buffer`,
          body: (
            <LiquidationBufferTooltipContent
              amount={maybe(data, ({ liquidationBufferAmount }) => formatAmount(liquidationBufferAmount, borrowSymbol))}
            />
          ),
        }}
        testId="health-details-liquidation-buffer-metric"
        value={mapQuery(position, ({ liquidationBuffer }) => liquidationBuffer)}
        notional={mapQuery(position, ({ liquidationBufferAmount }) =>
          formatAmount(liquidationBufferAmount, borrowSymbol),
        )}
        valueOptions={{
          abbreviate: false,
          color: maybe(data, data => Feedback[getLiquidationBufferFeedback(data, thresholds)]),
          formatter: value => formatNumber(value, 'percent.value'),
          unit: { symbol: `\u00a0${t`of debt`}`, position: 'suffix' },
        }}
      />
    </MetricsGrid>
  )
}
