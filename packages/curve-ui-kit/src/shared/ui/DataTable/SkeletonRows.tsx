import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import type { Column } from '@tanstack/react-table'
import { setTimeoutInterval } from '@ui-kit/utils/timers'
import { useCellSx, type TableItem, type TanstackTable } from './data-table.utils'

const SKELETON_WIDTHS = ['82%', '64%', '72%', '58%', '68%', '76%', '62%'] as const

function getSkeletonWidth(columnIndex: number, rowIndex: number) {
  // Alternate widths slightly per row so loading looks more natural.
  return SKELETON_WIDTHS[(columnIndex + rowIndex) % SKELETON_WIDTHS.length]
}

const SkeletonCell = <T extends TableItem>({
  column,
  isSticky,
  columnIndex,
  rowIndex,
}: {
  isSticky: boolean
  column: Column<T>
  columnIndex: number
  rowIndex: number
}) => {
  const width = getSkeletonWidth(columnIndex, rowIndex)

  return (
    <TableCell sx={useCellSx({ isSticky, column })}>
      {columnIndex === 0 ? (
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <Skeleton animation="wave" variant="circular" width={28} height={28} />
          <Box sx={{ width: '100%' }}>
            <Skeleton animation="wave" variant="text" width={width} height={20} sx={{ transform: 'none' }} />
            <Skeleton
              animation="wave"
              variant="text"
              width="42%"
              height={16}
              sx={{ transform: 'none', opacity: 0.75 }}
            />
          </Box>
        </Stack>
      ) : (
        <Skeleton animation="wave" variant="text" width={width} height={20} sx={{ transform: 'none' }} />
      )}
    </TableCell>
  )
}

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
              <SkeletonCell
                key={column.id}
                isSticky={shouldStickFirstColumn && !columnIndex}
                column={column}
                columnIndex={columnIndex}
                rowIndex={rowIndex}
              />
            ))}
        </TableRow>
      ))}
    </>
  )
}
