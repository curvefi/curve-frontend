import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import type { MintMarketRow } from '../../../types'

export const NumberCell = ({ getValue }: CellContext<MintMarketRow, number>) => (
  <Typography variant="tableCellMRegular" textAlign="right">
    {getValue().toLocaleString()}
  </Typography>
)
