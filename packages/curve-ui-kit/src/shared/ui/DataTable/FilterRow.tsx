import type { ReactNode } from 'react'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { TableItem, TanstackTable } from './data-table.utils'

const { Sizing } = SizesAndSpaces

export const FilterRow = <T extends TableItem>({
  table,
  children,
}: {
  children: ReactNode
  table: TanstackTable<T>
}) => (
  <TableRow sx={{ height: Sizing['xxl'] }}>
    <TableCell
      colSpan={table.getHeaderGroups().reduce((count, { headers }) => count + headers.length, 0)}
      sx={(t) => ({ backgroundColor: t.design.Layer[1].Fill, padding: 0, borderBottomWidth: 0 })}
      data-testid="table-filters"
    >
      {children}
    </TableCell>
  </TableRow>
)
