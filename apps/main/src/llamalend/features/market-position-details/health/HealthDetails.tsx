import {
  getHealthTextColor,
  getLiquidationBufferTextColor,
  type PositionHealthThresholds,
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
import { WithSkeleton } from '@ui/components/WithSkeleton'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { BORROW_METRIC_TOOLTIP } from '../market-position-details.utils'
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
  thresholds: PositionHealthThresholds
  borrowSymbol: string | undefined
}) => {
  const theme = useTheme()
  const { data } = position
  return (
    <>
      <Stack sx={{ gridRow: 'span 2', alignItems: 'start', gap: Spacing.xs }}>
        <Metric
          category="llamalend.positionHealth"
          label={t`Health`}
          valueTooltip={{
            title: t`Health`,
            body: <HealthTooltipContent status={data?.status} />,
            ...BORROW_METRIC_TOOLTIP,
          }}
          testId="health-details-health-metric"
          value={mapQuery(position, ({ health }) => health)}
          valueOptions={{
            abbreviate: false,
            color: maybe(data, data => getHealthTextColor(data, thresholds, theme)),
            formatter: value => formatNumber(value, 'health'),
          }}
        />
        <WithSkeleton
          loading={position.isLoading}
          variant="rounded"
          width="5rem"
          height={SizesAndSpaces.Badge.Size.extraSmall}
        >
          {data && (
            <Badge
              data-testid="health-details-status-badge"
              size="extraSmall"
              {...POSITION_STATUS_BADGE[data.status]}
            />
          )}
        </WithSkeleton>
      </Stack>
      <Metric
        category="llamalend.positionLiquidationBuffer"
        label={t`Liquidation buffer`}
        valueTooltip={{
          title: t`Liquidation buffer`,
          body: (
            <LiquidationBufferTooltipContent
              amount={maybe(data, ({ liquidationBufferAmount }) => formatAmount(liquidationBufferAmount, borrowSymbol))}
            />
          ),
          ...BORROW_METRIC_TOOLTIP,
        }}
        testId="health-details-liquidation-buffer-metric"
        value={mapQuery(position, ({ liquidationBuffer }) => liquidationBuffer)}
        notional={mapQuery(position, ({ liquidationBufferAmount }) =>
          formatAmount(liquidationBufferAmount, borrowSymbol),
        )}
        valueOptions={{
          abbreviate: false,
          color: maybe(data, data => getLiquidationBufferTextColor(data, theme)),
          formatter: value => formatNumber(value, 'percent.value'),
          // unicode needed so "of debt" keeps a space before it, a normal space would be removed
          unit: { symbol: `\u00a0${t`of debt`}`, position: 'suffix' },
        }}
      />
    </>
  )
}
