import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import type { CellContext } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'

export const PercentCell = ({ getValue }: CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>) => (
  <Typography variant="tableCellMBold" color="textPrimary" sx={{ textAlign: 'right' }}>
    {formatNumber(getValue(), 'percent.rate')}
  </Typography>
)
