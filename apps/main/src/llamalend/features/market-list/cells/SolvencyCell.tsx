import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { formatPercent } from '@ui-kit/utils'

export const SolvencyCell = ({ getValue }: CellContext<LlamaMarket, number | null | undefined>) => {
  const value = getValue()
  return (
    <Typography variant="tableCellMBold" color="textPrimary" sx={{ textAlign: 'right' }}>
      {value == null ? '-' : formatPercent(value)}
    </Typography>
  )
}
