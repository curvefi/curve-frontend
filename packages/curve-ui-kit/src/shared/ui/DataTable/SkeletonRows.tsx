import Skeleton from '@mui/material/Skeleton'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { getCellSx, getCellVariant } from '@ui-kit/shared/ui/DataTable/DataCell'
import { type TableItem, type TanstackTable } from './data-table.utils'

export const SkeletonRows = <T extends TableItem>({
  table,
  shouldStickFirstColumn,
  length = 3,
}: {
  table: TanstackTable<T>
  shouldStickFirstColumn: boolean
  length?: number
}) => (
  <>
    {Array.from({ length }).map((_, i) => (
      <TableRow key={`loading-row-${i}`} data-testid={`data-table-loading-${i}`}>
        {table
          .getHeaderGroups()
          .flatMap((headerGroup) => headerGroup.headers)
          .map(({ column }, index) => (
            <TableCell
              key={`loading-row-${index}`}
              sx={getCellSx({ isSticky: shouldStickFirstColumn && !index, column })}
            >
              <Skeleton variant="rectangular" sx={{ maxWidth: 'none' }}>
                <Typography
                  variant={getCellVariant(column)}
                  data-variant={getCellVariant(column)}
                  data-testid={`data-table-cell-${column.id}`}
                  sx={{ paddingBlock: '9px' }} // hardcoded to match the correct height of the cells
                >
                  0
                </Typography>
              </Skeleton>
            </TableCell>
          ))}
      </TableRow>
    ))}
  </>
)
