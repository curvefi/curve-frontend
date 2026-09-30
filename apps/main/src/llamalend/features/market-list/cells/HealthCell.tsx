import { HealthBar } from '@/llamalend/features/market-position-details'
import {
  formatOracleHealth,
  formatBufferPercent,
} from '@/llamalend/features/market-position-details/position-metrics.utils'
import { STATUS_BADGE_COLOR } from '@/llamalend/features/market-position-details/position-status-badge'
import {
  getRangeHealthFeedback,
  isCriticalBuffer,
} from '@/llamalend/features/market-position-details/position-status.utils'
import { getMarketAssetsType } from '@/llamalend/market-assets-type.utils'
import { getPositionStatusContent } from '@/llamalend/position-status-content'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import { requireChainId } from '@evm-ui/utils'
import { Stack } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { formatNumber } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import { Badge } from '@ui/components/Badge'
import { Tooltip } from '@ui/components/Tooltip'
import { TooltipDescription } from '@ui/components/TooltipComponents'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { decimal } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import { getUserPositionOracleHealth, getUserPositionStatus } from '../user-position.utils'
import { ErrorCell } from './ErrorCell'
import { PositionMetricCell } from './PositionMetricCell'

const { Spacing } = SizesAndSpaces

export const HealthCell = ({ getValue, row }: CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>) => {
  const { assets } = row.original
  const { data: { status } = {}, error } = row.original.positionQueries.stats
  const theme = useTheme()
  const health = getValue()
  const beta = useNewLlamalendHealth()
  const content = status ? getPositionStatusContent(assets.collateral.symbol, assets.borrowed.symbol)[status] : null
  const risk = row.original.positionQueries.risk
  const riskError = risk.oracle.error ?? risk.prices.error ?? risk.fullHealth.error

  if (beta) {
    const oracleHealthValue = getUserPositionOracleHealth(row.original)
    const positionStatus = getUserPositionStatus(row.original)
    const healthFeedback = getRangeHealthFeedback(
      decimal(oracleHealthValue),
      getMarketAssetsType(requireChainId(row.original.chain), row.original.controllerAddress),
    )
    return (
      <PositionMetricCell
        error={riskError}
        hasData={oracleHealthValue != undefined}
        testId="user-position-health"
        valueTestId="user-position-health-value"
        value={maybe(decimal(oracleHealthValue), formatOracleHealth)}
        valueSx={{ color: healthFeedback ? theme.design.Text.TextColors.Feedback[healthFeedback] : undefined }}
        support={
          positionStatus && (
            <Badge size="extraSmall" color={STATUS_BADGE_COLOR[positionStatus.severity]} label={positionStatus.label} />
          )
        }
      />
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
  const theme = useTheme()
  const value = decimal(buffer)
  return (
    <PositionMetricCell
      error={error}
      hasData={value != undefined}
      value={maybe(value, formatBufferPercent)}
      valueSx={{
        color: isCriticalBuffer(
          value,
          getMarketAssetsType(requireChainId(row.original.chain), row.original.controllerAddress),
        )
          ? theme.design.Text.TextColors.Feedback.Error
          : undefined,
      }}
    />
  )
}
