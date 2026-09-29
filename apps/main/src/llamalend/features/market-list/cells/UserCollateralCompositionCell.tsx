import { formatShareLabel } from '@/llamalend/features/market-position-details/position-metrics.utils'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { getUserPositionComposition } from '../user-position.utils'
import { PositionMetricCell } from './PositionMetricCell'

export const UserCollateralCompositionCell = ({
  row,
}: CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>) => {
  const stats = row.original.positionQueries.stats
  const composition = getUserPositionComposition(row.original)
  const { collateral, borrowed } = row.original.assets
  return (
    <PositionMetricCell
      error={stats.error}
      hasData={stats.data != null}
      testId="user-position-composition"
      value={
        composition ? `${formatShareLabel(composition.collateralLabel)}% ${collateral.symbol}` : undefined
      }
      support={
        composition && (
          <Typography variant="bodySRegular" color="textSecondary">
            {`${formatShareLabel(composition.borrowedLabel)}% ${borrowed.symbol}`}
          </Typography>
        )
      }
    />
  )
}
