import { getUserPositionEquity, getUserPositionPnl } from '@/llamalend/features/market-list/user-position.utils'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { PositionMetricCell } from './PositionMetricCell'

const signed = (value: number) => `${value > 0 ? '+' : ''}${formatNumber(value, { abbreviate: true })}`

/** Equity in the debt token, since markets are not all USD-denominated, with PnL below. The column sorts by USD value. */
export const UserEquityCell = ({ row }: CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>) => {
  const { stats } = row.original.positionQueries
  const { symbol } = row.original.assets.borrowed
  const equity = getUserPositionEquity(row.original)
  const result = getUserPositionPnl(row.original)
  const pnl = result && Number(result.pnl)
  return (
    <PositionMetricCell
      error={stats.error}
      hasData={stats.data != null}
      value={maybe(equity, amount => `${formatNumber(amount, { abbreviate: true })} ${symbol}`)}
      valueTestId="user-position-equity-value"
      support={
        pnl != null && (
          <Typography
            variant="bodySRegular"
            color={pnl > 0 ? 'success' : pnl < 0 ? 'error' : 'textSecondary'}
            data-testid="user-position-equity-pnl"
          >
            {signed(pnl)}
            {result?.percent != null && ` (${signed(Number(result.percent))}%)`}
          </Typography>
        )
      }
    />
  )
}
