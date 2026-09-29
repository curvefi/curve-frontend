import { formatYieldMultiplier } from '@/llamalend/features/market-position-details/position-roe.utils'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { getUserPositionRoeResult } from '../user-position.utils'
import { PositionMetricCell } from './PositionMetricCell'

export const UserReturnOnEquityCell = ({
  row,
}: CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>) => {
  const theme = useTheme()
  const stats = row.original.positionQueries.stats
  const roe = getUserPositionRoeResult(row.original)
  const multiplier = roe ? formatYieldMultiplier(roe.multiplier) : undefined
  const negative = roe?.multiplier.kind === 'negative'
  return (
    <PositionMetricCell
      error={stats.error}
      hasData={stats.data != null}
      testId="user-position-roe"
      value={maybe(roe, result => formatNumber(result.aprPercent, 'percent.rate'))}
      valueSx={{ color: negative ? theme.design.Text.TextColors.Feedback.Error : undefined }}
      support={
        multiplier && (
          <Typography variant="bodyXsRegular" color="textSecondary" data-testid="user-position-yield-multiplier">
            {multiplier}
          </Typography>
        )
      }
    />
  )
}
