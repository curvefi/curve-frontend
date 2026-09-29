import { formatBufferNotional, formatOracleHealth, formatSignedPercent } from '@/llamalend/features/market-position-details/position-metrics.utils'
import { STATUS_BADGE_COLOR } from '@/llamalend/features/market-position-details/position-status-badge'
import {
  isCriticalBuffer,
  PROVISIONAL_POSITION_THRESHOLDS,
} from '@/llamalend/features/market-position-details/position-status.utils'
import { bufferTooltip, healthTooltip, statusTooltip } from '@/llamalend/features/market-position-details/PositionMetricTooltip'
import type { BorrowPositionView } from '@/llamalend/position-metrics/use-borrow-position-view'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import { Badge } from '@ui/components/Badge'
import { Metric } from '@ui/components/Metric'
import { Tooltip } from '@ui/components/Tooltip'
import { mapQuery, q } from '@ui/features/queries/util'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { decimal } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'

export const BetaHealthDetails = ({ view, borrowSymbol }: { view: BorrowPositionView; borrowSymbol: string }) => {
  const isMobile = useIsMobile()
  const theme = useTheme()
  const assetsThresholds = view.assetsType ? PROVISIONAL_POSITION_THRESHOLDS[view.assetsType] : undefined
  const bufferIsRed = isCriticalBuffer(view.fullHealth.data, view.assetsType)
  const bufferColor = bufferIsRed ? theme.design.Text.TextColors.Feedback.Error : undefined
  const status = view.status
  const healthSettled = view.health.data != null || (!view.health.isLoading && view.health.error == null)
  const statusBadge = status && healthSettled && (
    <Tooltip
      {...statusTooltip({
        label: status.label,
        category: view.assetsType,
        nearRange: assetsThresholds ? `${assetsThresholds.nearRangeDropPercent}%` : undefined,
        criticalBuffer: `${assetsThresholds?.criticalBufferPercent ?? '0'}%`,
        observedAt: view.fullHealthUpdatedAt > 0 ? view.fullHealthUpdatedAt : undefined,
      })}
    >
      <Badge
        data-testid="position-status"
        size="extraSmall"
        color={STATUS_BADGE_COLOR[status.severity]}
        label={status.label}
      />
    </Tooltip>
  )
  return (
    <>
      <Box sx={{ gridArea: 'health' }} data-testid="beta-health-details">
        <Metric
          category="llamalend.legacyPositionHealth"
          label={t`Health`}
          testId="health-details-health-metric"
          value={view.health}
          valueOptions={{
            abbreviate: false,
            formatter: value => {
              const parsed = decimal(value)
              return parsed == undefined ? '' : formatOracleHealth(parsed)
            },
          }}
          valueTooltip={healthTooltip()}
          notional={statusBadge}
        />
      </Box>
      <Box sx={{ gridArea: 'buffer' }}>
        <Metric
          category="llamalend.positionCardTop"
          label={t`Liquidation buffer`}
          testId="health-details-liquidation-buffer-metric"
          value={view.fullHealth}
          notional={
            status?.bufferUnavailable
              ? q({ data: t`Buffer unavailable`, isLoading: false, error: null })
              : isMobile
                ? undefined
                : mapQuery(view.buffer, amount => formatBufferNotional(amount, borrowSymbol))
          }
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
            criticalBuffer: assetsThresholds?.criticalBufferPercent ?? '0',
          })}
        />
      </Box>
    </>
  )
}
