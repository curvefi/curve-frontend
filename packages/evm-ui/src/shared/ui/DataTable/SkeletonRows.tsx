import { useIncreasingLength, type IncreasingLengthCategory } from '@evm-ui/hooks/useIncreasingLength'
import Skeleton from '@mui/material/Skeleton'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import type { Column, ReactTable, RowData } from '@tanstack/react-table'
import { getCellVariant, type CurveTableFeatures } from './data-table.utils'
import { useCellSx } from './hooks/useCellSx'

const SkeletonCell = <TData extends RowData>({
  column,
  isSticky,
}: {
  isSticky: boolean
  column: Column<CurveTableFeatures, TData>
}) => (
  <TableCell sx={useCellSx({ isSticky, columnType: column.columnDef.meta?.type })}>
    <Skeleton variant="rectangular" sx={{ maxWidth: 'none' }}>
      <Typography
        variant={getCellVariant(column.columnDef.meta?.variant)}
        data-testid={`data-table-cell-${column.id}`}
        sx={{ paddingBlock: '9px' }} // hardcoded to match the correct height of the cells
      >
        0
      </Typography>
    </Skeleton>
  </TableCell>
)

export const SkeletonRows = <TData extends RowData>({
  table,
  shouldStickFirstColumn,
  increasingLength,
}: {
  table: ReactTable<CurveTableFeatures, TData>
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
