import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import type { YieldBasisPoolRow } from '../../../types'

export const NumberCell = ({ getValue }: CellContext<YieldBasisPoolRow, number>) => (
  <Typography variant="tableCellMRegular" textAlign="right">
    {getValue().toLocaleString()}
  </Typography>
)
