import type { ReactNode } from 'react'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { TableItem, TanstackTable } from './data-table.utils'

const { Height, Spacing } = SizesAndSpaces

export type EmptyStateRowSize = keyof typeof Height.table.noResults

const SPACING_SIZE_MAP: Record<EmptyStateRowSize, keyof typeof Spacing> = {
  sm: 'md',
  lg: 'xl',
}

export const EmptyStateRow = <T extends TableItem>({
  table,
  size = 'lg',
  children,
}: {
  children: ReactNode
  size?: EmptyStateRowSize
  table: TanstackTable<T>
}) => (
  <TableRow data-testid="table-empty-row" sx={{ height: Height.table.noResults[size] }}>
    <Typography
      variant="tableCellL"
      colSpan={table.getHeaderGroups().reduce((count, { headers }) => count + headers.length, 0)}
      component="td"
      sx={{ padding: Spacing[SPACING_SIZE_MAP[size]], textAlign: 'center' }}
    >
      {children}
    </Typography>
  </TableRow>
)
