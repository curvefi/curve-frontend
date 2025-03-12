import { LlamaMarket } from '@/loan/entities/llama-markets'
import { CellContext } from '@tanstack/react-table'
import { formatNumber } from '@ui/utils'

export const CompactUsdCell = ({ getValue }: CellContext<LlamaMarket, number>) => {
  const value = getValue()
  return value ? formatNumber(value, { currency: 'USD', notation: 'compact' }) : '-'
}
