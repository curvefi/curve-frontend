import type { ReactNode } from 'react'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import type { ReactTable, RowData } from '@tanstack/react-table'
import type { CurveTableFeatures } from './data-table.utils'

export const FilterRow = <T extends RowData>({
  table,
  children,
  testId,
}: {
  children: ReactNode
  table: ReactTable<CurveTableFeatures, T>
  testId?: string
}) => (
  <TableRow>
    <TableCell
      colSpan={table.getHeaderGroups().reduce((count, { headers }) => count + headers.length, 0)}
      sx={{ padding: 0 }}
      data-testid={testId}
    >
      {children}
    </TableCell>
  </TableRow>
)
