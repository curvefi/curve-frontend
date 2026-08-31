import type { ReactNode } from 'react'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'

export const LegacyFilterRow = ({ colSpan, children }: { children: ReactNode; colSpan: number }) => (
  <TableRow>
    <TableCell
      colSpan={colSpan}
      sx={t => ({ backgroundColor: t.design.Layer[1].Fill, padding: 0 })}
      data-testid="table-filters"
    >
      {children}
    </TableCell>
  </TableRow>
)
