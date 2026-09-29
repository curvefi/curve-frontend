import { formatRangeBounds } from '@/llamalend/features/market-position-details/position-metrics.utils'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { t } from '@ui/lib/i18n'
import { getTokenPairUnit } from '@ui/lib/tokens'
import { PositionMetricCell } from './PositionMetricCell'

export const UserLiquidationRangeCell = ({
  row,
}: CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>) => {
  const { data: prices, error, isLoading } = row.original.positionQueries.risk.prices
  const { collateral, borrowed } = row.original.assets
  return (
    <PositionMetricCell
      error={error}
      hasData={prices != null}
      testId="user-position-liquidation-range"
      value={
        prices ? formatRangeBounds(prices[1], prices[0]) : !isLoading && !error ? t`Unavailable` : undefined
      }
      support={
        prices && (
          <Typography variant="bodyXsRegular" color="textSecondary">
            {getTokenPairUnit([collateral.symbol, borrowed.symbol])}
          </Typography>
        )
      }
    />
  )
}
