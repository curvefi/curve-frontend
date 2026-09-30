import {
  formatPriceDistanceHeadline,
  formatPriceDistanceDescription,
  formatRangeLabel,
} from '@/llamalend/features/market-position-details/position-metrics.utils'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import Typography from '@mui/material/Typography'
import { maybe } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { getTokenPairUnit } from '@ui/lib/tokens'
import { getUserPositionPriceDistance } from '../user-position.utils'
import { PositionMetricCell } from './PositionMetricCell'

export const UserDistanceToRangeCell = ({
  row,
}: CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>) => {
  const { oracle, prices } = row.original.positionQueries.risk
  const distance = getUserPositionPriceDistance(row.original)
  const range = prices.data
  const { collateral, borrowed } = row.original.assets
  const unit = getTokenPairUnit([collateral.symbol, borrowed.symbol])
  return (
    <PositionMetricCell
      error={oracle.error ?? prices.error}
      hasData={distance != undefined}
      testId="user-position-distance"
      value={maybe(distance, formatPriceDistanceHeadline)}
      valueAriaLabel={maybe(distance, formatPriceDistanceDescription)}
      support={
        range && (
          <Typography variant="bodySRegular" color="textSecondary">
            {formatRangeLabel(range[1], range[0], unit)}
          </Typography>
        )
      }
    />
  )
}
