import { getUserPositionEquity, getUserPositionPnl } from '@/llamalend/features/market-list/user-position.utils'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import Typography from '@mui/material/Typography'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import { Tooltip } from '@ui/components/Tooltip'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { t } from '@ui/lib/i18n'
import { PositionMetricCell } from './PositionMetricCell'

const signed = (value: number) => `${value > 0 ? '+' : ''}${formatNumber(value, { abbreviate: true })}`

const pnlText = (pnl: number, symbol: string, percent: Decimal | undefined) =>
  `${signed(pnl)} ${symbol}${percent == undefined ? '' : ` (${signed(Number(percent))}%)`}`

/**
 * Equity in the debt token, since markets are not all USD-denominated. PnL below in the collateral token, like
 * Summer.fi, DeFi Saver and Kamino, with its debt-token value on hover. The column sorts by USD value.
 */
export const UserEquityCell = ({ row }: CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>) => {
  const { stats } = row.original.positionQueries
  const { borrowed, collateral } = row.original.assets
  const equity = getUserPositionEquity(row.original)
  const result = getUserPositionPnl(row.original)
  const pnl = maybe(result?.pnlCollateral, Number)
  return (
    <PositionMetricCell
      error={stats.error}
      hasData={stats.data != null}
      value={maybe(equity, amount => `${formatNumber(amount, { abbreviate: true })} ${borrowed.symbol}`)}
      valueTestId="user-position-equity-value"
      support={
        result &&
        pnl != null && (
          <Tooltip
            title={t`PnL (ROE)`}
            body={
              <Typography variant="bodySRegular" data-testid="user-position-equity-pnl-debt">
                {t`In ${borrowed.symbol}:`} {pnlText(Number(result.pnl), borrowed.symbol, result.percent)}
              </Typography>
            }
            placement="top"
          >
            <Typography
              variant="bodySRegular"
              color={pnl > 0 ? 'success' : pnl < 0 ? 'error' : 'textSecondary'}
              data-testid="user-position-equity-pnl"
            >
              {pnlText(pnl, collateral.symbol, result.percentCollateral)}
            </Typography>
          </Tooltip>
        )
      }
    />
  )
}
