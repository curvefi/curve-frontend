import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { CellContext } from '@tanstack/react-table'
import { formatNumber } from '@ui/utils'

export const CompactUsdCell = ({ getValue }: CellContext<LlamaMarket, number>) => {
  const value = getValue()
  return value != null && formatNumber(value, { currency: 'USD', notation: 'compact' })
}
