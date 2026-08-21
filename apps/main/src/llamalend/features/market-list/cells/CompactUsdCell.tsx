import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { formatNumber } from '@evm-ui/utils'
import { CellContext } from '@tanstack/react-table'

export const CompactUsdCell = ({ getValue }: CellContext<LlamaMarketRow, number>) => {
  const value = getValue()
  return value != null && formatNumber(value, 'usd.notional')
}
