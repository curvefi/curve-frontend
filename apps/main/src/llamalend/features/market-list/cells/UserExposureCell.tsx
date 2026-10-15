import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { PositionMetricCell } from './PositionMetricCell'

/** Shows exposure in the debt token, since markets are not all USD-denominated. The column sorts by USD value. */
export const UserExposureCell = ({ row }: CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>) => {
  const { stats } = row.original.positionQueries
  const { collateral, borrowed } = row.original.assets
  const value = stats.data && stats.data.collateral * stats.data.oraclePrice
  return (
    <PositionMetricCell
      error={stats.error}
      hasData={stats.data != null}
      value={maybe(value, amount => `${formatNumber(amount, { abbreviate: true })} ${borrowed.symbol}`)}
      valueTestId="user-position-exposure-value"
      support={
        stats.data != null && (
          <Typography variant="bodySRegular" color="textSecondary" data-testid="user-position-exposure-amount">
            {formatNumber(stats.data.collateral, { abbreviate: true })} {collateral.symbol}
          </Typography>
        )
      }
    />
  )
}
