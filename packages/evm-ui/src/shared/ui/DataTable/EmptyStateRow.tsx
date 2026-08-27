import type { ReactNode } from 'react'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

const { Height, Spacing } = SizesAndSpaces

export type EmptyStateRowSize = keyof typeof Height.table.noResults

const SPACING_SIZE_MAP: Record<EmptyStateRowSize, keyof typeof Spacing> = {
  sm: 'md',
  lg: 'xl',
}

export const EmptyStateRow = ({
  colSpan,
  size = 'lg',
  children,
}: {
  children: ReactNode
  colSpan: number
  size?: EmptyStateRowSize
}) => (
  <TableRow data-testid="table-empty-row" sx={{ height: Height.table.noResults[size] }}>
    <Typography
      variant="tableCellL"
      colSpan={colSpan}
      component="td"
      sx={{ padding: Spacing[SPACING_SIZE_MAP[size]], textAlign: 'center' }}
    >
      {children}
    </Typography>
  </TableRow>
)
