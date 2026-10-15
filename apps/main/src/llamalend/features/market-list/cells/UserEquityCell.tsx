import { getUserPositionEquity, getUserPositionPnl } from '@/llamalend/features/market-list/user-position.utils'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { PnlLine } from '@/llamalend/widgets/PnlLine'
import { formatNumber } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { PositionMetricCell } from './PositionMetricCell'

/** Equity in the debt token, since markets are not all USD-denominated, with PNL below. The column sorts by USD value. */
export const UserEquityCell = ({ row }: CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>) => {
  const { stats } = row.original.positionQueries
  const { borrowed, collateral } = row.original.assets
  const equity = getUserPositionEquity(row.original)
  const pnl = getUserPositionPnl(row.original)
  return (
    <PositionMetricCell
      error={stats.error}
      hasData={stats.data != null}
      value={maybe(equity, amount => `${formatNumber(amount, { abbreviate: true })} ${borrowed.symbol}`)}
      valueTestId="user-position-equity-value"
      support={
        pnl && (
          <PnlLine
            pnl={pnl}
            collateralSymbol={collateral.symbol}
            borrowSymbol={borrowed.symbol}
            testId="user-position-equity-pnl"
          />
        )
      }
    />
  )
}
