import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { formatNumber } from '@evm-ui/utils'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'

export const PercentCell = ({ getValue }: CellContext<LlamaMarketRow, number>) => (
  <Typography variant="tableCellMBold" color="textPrimary" sx={{ textAlign: 'right' }}>
    {formatNumber(getValue(), 'percent.rate')}
  </Typography>
)
