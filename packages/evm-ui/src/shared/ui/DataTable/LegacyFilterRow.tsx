import type { ReactNode } from 'react'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import type { ReactTable } from '@tanstack/react-table'
import type { CurveTableFeatures, CurveTableItem } from './data-table.utils'

export const LegacyFilterRow = <T extends CurveTableItem>({
  table,
  children,
}: {
  children: ReactNode
  table: ReactTable<CurveTableFeatures, T>
}) => (
  <TableRow>
    <TableCell
      colSpan={table.getHeaderGroups().reduce((count, { headers }) => count + headers.length, 0)}
      sx={t => ({ backgroundColor: t.design.Layer[1].Fill, padding: 0 })}
      data-testid="table-filters"
    >
      {children}
    </TableCell>
  </TableRow>
)
