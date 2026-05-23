import { Stack } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { type Cell, flexRender } from '@tanstack/react-table'
import { ChevronDownIcon } from '@ui-kit/shared/icons/ChevronDownIcon'
import { useCellSx, getCellVariant, type TableItem } from './data-table.utils'
import { RotatableIcon } from './RotatableIcon'

export const DataCell = <T extends TableItem>({
  cell,
  enableCollapse,
  isSticky,
}: {
  cell: Cell<T, unknown>
  enableCollapse: boolean
  isSticky: boolean
}) => {
  const { column, row } = cell
  const children = flexRender(column.columnDef.cell, cell.getContext())
  const showCollapseIcon = enableCollapse && column.getIsLastColumn()
  const [sx, wrapperSx] = useCellSx({ column, showCollapseIcon, isSticky })
  return (
    <Typography
      variant={getCellVariant(column)}
      component="td"
      data-testid={`data-table-cell-${column.id}`}
      sx={[
        {
          color: 'text.primary',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {showCollapseIcon ? (
        <Stack direction="row" sx={{ alignItems: 'center', width: '100%' }}>
          <Box
            sx={[
              {
                flexGrow: 1,
              },
              ...(Array.isArray(wrapperSx) ? wrapperSx : [wrapperSx]),
            ]}
          >
            {children}
          </Box>
          <RotatableIcon
            icon={ChevronDownIcon}
            rotated={row.getIsExpanded()}
            fontSize={28}
            testId={`${row.getIsExpanded() ? 'collapse' : 'expand'}-icon`}
          />
        </Stack>
      ) : (
        children
      )}
    </Typography>
  )
}
