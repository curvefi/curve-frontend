import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { formatNumber } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { PositionMetricCell } from './PositionMetricCell'

/** Equity in USD, so positions in different debt tokens compare at a glance. */
export const UserEquityCell = ({
  row,
  getValue,
}: CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>) => {
  const { stats } = row.original.positionQueries
  return (
    <PositionMetricCell
      error={stats.error}
      hasData={stats.data != null}
      value={maybe(getValue(), usd => formatNumber(usd, 'usd.notional'))}
      valueTestId="user-position-equity-value"
    />
  )
}
