import { LlamaMarket } from '@/llamalend/entities/llama-markets'
import { formatPercent } from '@/llamalend/format.utils'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'

/**
 * Looked into expanding the LtvCell component to support the max LTV value,
 * but that cell uses a user position hook which complicates the whole thing.
 *
 * The max LTV value comes from prices API, so figured a smaller separate
 * cell component was the way to go here.
 */
export const MaxLtvCell = ({ getValue }: CellContext<LlamaMarket, number>) => (
  <Typography variant="tableCellMBold" color="textPrimary" textAlign="right">
    {formatPercent(getValue())}
  </Typography>
)
