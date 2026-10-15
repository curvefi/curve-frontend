import { getUserPositionEquity, getUserPositionPnl } from '@/llamalend/features/market-list/user-position.utils'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { PositionMetricCell } from './PositionMetricCell'

const pnlColor = (value: number) => (value > 0 ? 'success' : value < 0 ? 'error' : 'textSecondary')

const signed = (value: number) => `${value > 0 ? '+' : ''}${formatNumber(value, { abbreviate: true })}`

/**
 * Equity in the debt token, since markets are not all USD-denominated. PnL below in the debt token and in the collateral
 * token, like Summer.fi, DeFi Saver and Kamino. The column sorts by USD value.
 */
export const UserEquityCell = ({ row }: CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>) => {
  const { stats } = row.original.positionQueries
  const { symbol } = row.original.assets.borrowed
  const collateralSymbol = row.original.assets.collateral.symbol
  const equity = getUserPositionEquity(row.original)
  const result = getUserPositionPnl(row.original)
  const pnl = result && Number(result.pnl)
  const pnlCollateral = maybe(result?.pnlCollateral, Number)
  return (
    <PositionMetricCell
      error={stats.error}
      hasData={stats.data != null}
      value={maybe(equity, amount => `${formatNumber(amount, { abbreviate: true })} ${symbol}`)}
      valueTestId="user-position-equity-value"
      support={
        pnl != null && (
          <Stack sx={{ alignItems: 'end' }}>
            <Typography variant="bodySRegular" color={pnlColor(pnl)} data-testid="user-position-equity-pnl">
              {signed(pnl)} {symbol}
              {result?.percent != null && ` (${signed(Number(result.percent))}%)`}
            </Typography>
            {pnlCollateral != null && (
              <Typography
                variant="bodySRegular"
                color={pnlColor(pnlCollateral)}
                data-testid="user-position-equity-pnl-collateral"
              >
                {signed(pnlCollateral)} {collateralSymbol}
              </Typography>
            )}
          </Stack>
        )
      }
    />
  )
}
