import Skeleton from '@mui/material/Skeleton'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import type { Column } from '@tanstack/react-table'
import { useIncreasingLength, type IncreasingLengthCategory } from '@ui-kit/hooks/useIncreasingLength'
import { useCellSx, getCellVariant, type TableItem, type TanstackTable } from './data-table.utils'

const SkeletonCell = <T extends TableItem>({ column, isSticky }: { isSticky: boolean; column: Column<T> }) => (
  <TableCell sx={useCellSx({ isSticky, column })}>
    <Skeleton variant="rectangular" sx={{ maxWidth: 'none' }}>
      <Typography
        variant={getCellVariant(column)}
        data-testid={`data-table-cell-${column.id}`}
        sx={{ paddingBlock: '9px' }} // hardcoded to match the correct height of the cells
      >
        0
      </Typography>
    </Skeleton>
  </TableCell>
)

export const SkeletonRows = <T extends TableItem>({
  table,
  shouldStickFirstColumn,
  increasingLength,
}: {
  table: TanstackTable<T>
  shouldStickFirstColumn: boolean
  increasingLength?: IncreasingLengthCategory
}) =>
  Array.from({ length: useIncreasingLength(increasingLength) }).map((_, rowIndex, array) => (
    // note: length is part of the key, so all rows are recreated and the skeleton animation is restarted
    // eslint-disable-next-line @eslint-react/no-array-index-key -- Existing violation before enabling this rule.
    <TableRow key={`loading-row-${rowIndex}-${array.length}`} data-testid={`data-table-loading-${rowIndex}`}>
      {table
        .getHeaderGroups()
        .flatMap(headerGroup => headerGroup.headers)
        .map(({ column }, columnIndex) => (
          <SkeletonCell key={column.id} isSticky={shouldStickFirstColumn && !columnIndex} column={column} />
        ))}
    </TableRow>
  ))
