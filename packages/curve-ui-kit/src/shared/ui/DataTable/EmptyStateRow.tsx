import type { ReactNode } from 'react'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { TableItem, TanstackTable } from './data-table.utils'

const { MinHeight } = SizesAndSpaces

export const EmptyStateRow = <T extends TableItem>({
  table,
  children,
}: {
  children: ReactNode
  table: TanstackTable<T>
}) => (
  <TableRow data-testid="table-empty-row" sx={{ height: MinHeight.tableNoResults }}>
    <Typography
      variant="tableCellL"
      colSpan={table.getHeaderGroups().reduce((count, { headers }) => count + headers.length, 0)}
      component="td"
      padding={7}
      textAlign="center"
    >
      {children}
    </Typography>
  </TableRow>
)
