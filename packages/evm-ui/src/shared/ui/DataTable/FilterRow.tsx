import type { ReactNode } from 'react'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'

export const FilterRow = ({ colSpan, children, testId }: { children: ReactNode; colSpan: number; testId?: string }) => (
  <TableRow>
    <TableCell colSpan={colSpan} sx={{ padding: 0 }} data-testid={testId}>
      {children}
    </TableCell>
  </TableRow>
)
