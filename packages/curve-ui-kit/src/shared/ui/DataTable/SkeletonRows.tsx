import { useEffect, useState } from 'react'
import Skeleton from '@mui/material/Skeleton'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import type { Column } from '@tanstack/react-table'
import { setTimeoutInterval } from '@ui-kit/utils/timers'
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
  initialLength = 3,
  increaseEveryMs = 5000,
  maxLength = 10,
}: {
  table: TanstackTable<T>
  shouldStickFirstColumn: boolean
  initialLength?: number
  increaseEveryMs?: number // after this time, the length will increase by 1
  maxLength?: number // maximum length of the skeleton rows
}) => {
  const [length, setLength] = useState(initialLength)
  useEffect(
    () => setTimeoutInterval(() => setLength((prevLength) => Math.min(maxLength, prevLength + 1)), increaseEveryMs),
    [increaseEveryMs, maxLength],
  )

  return (
    <>
      {Array.from({ length }).map((_, rowIndex) => (
        // note: length is part of the key, so all rows are recreated and the skeleton animation is restarted
        <TableRow key={`loading-row-${rowIndex}-${length}`} data-testid={`data-table-loading-${rowIndex}`}>
          {table
            .getHeaderGroups()
            .flatMap((headerGroup) => headerGroup.headers)
            .map(({ column }, columnIndex) => (
              <SkeletonCell key={column.id} isSticky={shouldStickFirstColumn && !columnIndex} column={column} />
            ))}
        </TableRow>
      ))}
    </>
  )
}
