import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { formatNumber } from '@ui-kit/utils'

export const MaxLeverageCell = ({ getValue }: CellContext<LlamaMarket, number | null>) => {
  const value = getValue()
  return (
    <Typography variant="tableCellMBold">
      {formatNumber(value, { abbreviate: false, fallback: '-', maximumSignificantDigits: 2, unit: 'multiplier' })}
    </Typography>
  )
}
