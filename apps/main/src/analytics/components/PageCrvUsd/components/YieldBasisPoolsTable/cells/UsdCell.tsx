import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { formatUsd } from '@ui-kit/utils'
import type { YieldBasisPoolRow } from '../../../types'

export const UsdCell = ({ getValue }: CellContext<YieldBasisPoolRow, number>) => (
  <Typography variant="tableCellMRegular" textAlign="right">
    {formatUsd(getValue())}
  </Typography>
)
