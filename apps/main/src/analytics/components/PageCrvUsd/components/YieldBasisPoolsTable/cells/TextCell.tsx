import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import type { YieldBasisPoolRow } from '../../../types'

export const TextCell = ({ row, getValue }: CellContext<YieldBasisPoolRow, string>) => (
  <Stack>
    <Typography variant="tableCellMBold">{getValue()}</Typography>
    <Typography variant="bodyXsRegular" color="textTertiary">
      {row.original.address}
    </Typography>
  </Stack>
)
