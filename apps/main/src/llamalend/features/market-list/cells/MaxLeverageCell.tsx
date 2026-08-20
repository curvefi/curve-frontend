import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { formatNumber } from '@evm-ui/utils'

export const MaxLeverageCell = ({ getValue }: CellContext<LlamaMarketRow, number | null>) => {
  const value = getValue()
  return (
    <Typography variant="tableCellMBold">
      {formatNumber(value, { abbreviate: false, fallback: '-', maximumSignificantDigits: 2, unit: 'multiplier' })}
    </Typography>
  )
}
