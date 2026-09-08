import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import type { CurveTableFeatures } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { formatNumber } from '@primitives/number.utils'
import type { CellContext } from '@tanstack/react-table'

export const CompactUsdCell = ({ getValue }: CellContext<CurveTableFeatures, LlamaMarketRow, number>) => {
  const value = getValue()
  return value != null && formatNumber(value, 'usd.notional')
}
