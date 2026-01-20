import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { formatPercent } from '@ui-kit/utils'

export const PercentCell = ({ getValue }: CellContext<LlamaMarket, number>) => (
  <Typography variant="tableCellMBold" color="textPrimary" textAlign="right">
    {formatPercent(getValue())}
  </Typography>
)
