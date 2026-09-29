import { formatRangeBounds } from '@/llamalend/features/market-position-details/position-metrics.utils'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import Typography from '@mui/material/Typography'
import { maybe } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { getTokenPairUnit } from '@ui/lib/tokens'
import { PositionMetricCell } from './PositionMetricCell'

export const UserLiquidationRangeCell = ({
  row,
}: CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>) => {
  const { data: prices, error, isLoading } = row.original.positionQueries.risk.prices
  const { collateral, borrowed } = row.original.assets
  const settledEmpty = prices == null && !isLoading && error == null
  return (
    <PositionMetricCell
      error={error}
      hasData={prices != null || settledEmpty}
      testId="user-position-liquidation-range"
      value={maybe(prices, range => formatRangeBounds(range[1], range[0]))}
      support={
        prices && (
          <Typography variant="bodySRegular" color="textSecondary">
            {getTokenPairUnit([collateral.symbol, borrowed.symbol])}
          </Typography>
        )
      }
    />
  )
}
