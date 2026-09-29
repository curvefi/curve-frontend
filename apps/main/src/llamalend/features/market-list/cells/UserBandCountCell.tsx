import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { formatNumber } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { PositionMetricCell } from './PositionMetricCell'

export const UserBandCountCell = ({
  getValue,
  row,
}: CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>) => {
  const stats = row.original.positionQueries.stats
  const count = getValue()
  return (
    <PositionMetricCell
      error={stats.error}
      hasData={stats.data != null}
      value={maybe(count, value => formatNumber(value, { abbreviate: false }))}
      valueTestId="user-position-bands"
    />
  )
}
