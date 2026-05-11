import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import type { SupplySummaryRow } from '../columns/columns.definitions'

export const LabelCell = ({ getValue }: CellContext<SupplySummaryRow, string>) => (
  <Typography variant="bodySRegular" color="textSecondary">
    {getValue()}
  </Typography>
)
