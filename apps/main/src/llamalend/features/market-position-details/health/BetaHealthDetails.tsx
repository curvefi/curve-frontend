import { useMarketContext } from '@/llamalend/features/market-context'
import {
  formatOracleHealth,
  formatSignedPercent,
} from '@/llamalend/features/market-position-details/position-metrics.utils'
import { STATUS_BADGE_COLOR } from '@/llamalend/features/market-position-details/position-status-badge'
import {
  isCriticalBuffer,
  PROVISIONAL_POSITION_THRESHOLDS,
} from '@/llamalend/features/market-position-details/position-status.utils'
import { bufferTooltip, healthTooltip, statusTooltip } from '@/llamalend/features/market-position-details/PositionMetricTooltip'
import type { BorrowPositionView } from '@/llamalend/position-metrics/use-borrow-position-view'
import { useBorrowPositionView } from '@/llamalend/position-metrics/use-borrow-position-view'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { Badge } from '@ui/components/Badge'
import { Metric } from '@ui/components/Metric'
import { Tooltip } from '@ui/components/Tooltip'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { decimal } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'

const { Spacing } = SizesAndSpaces

export const BetaHealthDetails = ({ view }: { view: BorrowPositionView }) => {
  const isMobile = useIsMobile()
  const theme = useTheme()
  const assetsThresholds = view.assetsType ? PROVISIONAL_POSITION_THRESHOLDS[view.assetsType] : undefined
  const bufferIsRed = isCriticalBuffer(view.fullHealth.data, view.assetsType)
  const bufferColor = bufferIsRed ? theme.design.Text.TextColors.Feedback.Error : undefined
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
        />
        {view.status && (
          <Tooltip
            {...statusTooltip({
              label: view.status.label,
              category: view.assetsType,
              nearRange: assetsThresholds ? `${assetsThresholds.nearRangeDropPercent}%` : undefined,
              criticalBuffer: `${assetsThresholds?.criticalBufferPercent ?? '0'}%`,
              observedAt: view.fullHealthUpdatedAt > 0 ? view.fullHealthUpdatedAt : undefined,
            })}
          >
            <Box sx={{ mt: Spacing.xxs, width: 'fit-content' }} data-testid="position-status">
              <Badge
                data-testid="position-status-label"
                size="extraSmall"
                color={STATUS_BADGE_COLOR[view.status.severity]}
                label={view.status.label}
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
          value={view.fullHealth}
          notional={isMobile ? undefined : view.bufferAmountLabel}
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
        {view.status?.bufferUnavailable && (
          <Typography variant="bodyXsRegular" color="textSecondary" data-testid="buffer-unavailable">
            {t`Buffer unavailable`}
          </Typography>
        )}
      </Box>
    </>
  )
}

/** Standalone beta health, for callers that do not already own the position view. */
export const BetaHealthDetailsGate = () => {
  const { chainId, marketId, userAddress } = useMarketContext()
  const view = useBorrowPositionView({ chainId, marketId, userAddress })
  return <BetaHealthDetails view={view} />
}
