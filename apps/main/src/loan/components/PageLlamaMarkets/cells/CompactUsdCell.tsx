import { formatNumber } from '@ui/utils'
import { CellContext } from '@tanstack/react-table'
import { LlamaMarket } from '@loan/entities/llama-markets'

export const CompactUsdCell = ({ getValue }: CellContext<LlamaMarket, number>) => {
  const value = getValue()
  return value ? formatNumber(value, { currency: 'USD', notation: 'compact' }) : '-'
}
