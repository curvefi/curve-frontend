import { Stack } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { type Cell, flexRender } from '@tanstack/react-table'
import { ChevronDownIcon } from '@ui-kit/shared/icons/ChevronDownIcon'
import { applySxProps } from '@ui-kit/utils'
import { useCellSx, getCellVariant, type TableItem } from './data-table.utils'
import { RotatableIcon } from './RotatableIcon'
import { TriangleDown } from '@ui-kit/shared/icons/TriangleDown'

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
      sx={applySxProps({ color: 'text.primary' }, sx)}
    >
      {showCollapseIcon ? (
        <Stack direction="row" sx={{ alignItems: 'center', width: '100%' }}>
          <Box sx={applySxProps({ flexGrow: 1 }, wrapperSx)}>{children}</Box>
          <RotatableIcon
            icon={TriangleDown}
            rotated={row.getIsExpanded()}
            fontSize={28}
            testId={`${row.getIsExpanded() ? 'collapse' : 'expand'}-icon`}
            sx={{ color: t => t.design.Button.Ghost.Default.Label }}
          />
        </Stack>
      ) : (
        children
      )}
    </Typography>
  )
}
