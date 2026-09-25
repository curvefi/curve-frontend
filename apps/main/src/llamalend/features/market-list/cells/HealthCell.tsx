import { HealthBar } from '@/llamalend/features/market-position-details'
import { formatOracleHealth, formatSignedPercent, isOracleHealthFloor } from '@/llamalend/features/market-position-details/position-metrics.utils'
import type { PositionSeverity } from '@/llamalend/features/market-position-details/position-status.utils'
import { getPositionStatusContent } from '@/llamalend/position-status-content'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import { Stack } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import { Badge } from '@ui/components/Badge'
import { Tooltip } from '@ui/components/Tooltip'
import { TooltipDescription } from '@ui/components/TooltipComponents'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import type { ChipColors } from '@ui/features/themes/components/chip/colors'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { decimal } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import { getUserPositionOracleHealth, getUserPositionStatus } from '../user-position.utils'
import { ErrorCell } from './ErrorCell'

const { Spacing } = SizesAndSpaces

const STATUS_BADGE_COLOR: Record<PositionSeverity, ChipColors> = {
  healthy: 'active',
  near: 'warning',
  protection: 'highlight',
  low: 'warning',
  critical: 'alert',
  liquidatable: 'alert',
  converted: 'accent',
  neutral: 'default',
}

export const HealthCell = ({ getValue, row }: CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>) => {
  const { assets } = row.original
  const { data: { status } = {}, error } = row.original.positionQueries.stats
  const health = getValue()
  const beta = useNewLlamalendHealth()
  const theme = useTheme()
  const content = status ? getPositionStatusContent(assets.collateral.symbol, assets.borrowed.symbol)[status] : null
  const risk = row.original.positionQueries.risk
  const riskError = risk.oracle.error ?? risk.prices.error ?? risk.fullHealth.error

  if (beta) {
    if (riskError && getUserPositionOracleHealth(row.original) == undefined) return <ErrorCell error={riskError} />
    const ratio = decimal(getUserPositionOracleHealth(row.original))
    const positionStatus = getUserPositionStatus(row.original)
    return (
      <Stack sx={{ gap: Spacing.xs, alignItems: 'flex-end' }}>
        {maybe(ratio, value => (
          <Typography
            component="span"
            variant="bodySRegular"
            sx={{ color: isOracleHealthFloor(value) ? theme.design.Text.TextColors.Feedback.Error : undefined }}
          >
            {formatOracleHealth(value)}
          </Typography>
        ))}
        {positionStatus && (
          <Badge size="extraSmall" color={STATUS_BADGE_COLOR[positionStatus.severity]} label={positionStatus.label} />
        )}
      </Stack>
    )
  }

  if (error) return <ErrorCell error={error} />

  return maybe(health, health => (
    <Tooltip
      title={content?.title ?? t`Position active`}
      body={<TooltipDescription text={content?.description ?? t`You have an active position in this market.`} />}
      placement="top"
    >
      <Stack sx={{ gap: Spacing.xs }}>
        {formatNumber(health, 'percent.value')}
        <HealthBar small health={health} softLiquidation={status === 'softLiquidation'} />
      </Stack>
    </Tooltip>
  ))
}

export const LiquidationBufferCell = ({
  getValue,
  row,
}: CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>) => {
  const error = row.original.positionQueries.risk.fullHealth.error
  const buffer = getValue()
  if (error && buffer == undefined) return <ErrorCell error={error} />
  return maybe(decimal(buffer), formatSignedPercent)
}
