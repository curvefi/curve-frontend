import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import type { MintMarketRow } from '../../../types'

export const TextCell = ({ getValue }: CellContext<MintMarketRow, string>) => (
  <Typography variant="tableCellMBold">{getValue()}</Typography>
)
