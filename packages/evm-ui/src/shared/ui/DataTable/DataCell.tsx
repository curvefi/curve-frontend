import { TriangleDown } from '@evm-ui/shared/icons/TriangleDown'
import { applySxProps } from '@evm-ui/utils'
import { Stack } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { type Cell, flexRender } from '@tanstack/react-table'
import { getCellVariant, type CurveTableFeatures, type CurveTableItem } from './data-table.utils'
import { useCellSx } from './hooks/useCellSx'
import { RotatableIcon } from './RotatableIcon'

export const DataCell = <T extends CurveTableItem>({
  cell,
  enableCollapse,
  isSticky,
}: {
  cell: Cell<CurveTableFeatures, T, unknown>
  enableCollapse: boolean
  isSticky: boolean
}) => {
  const { column, row } = cell
  const children = flexRender(column.columnDef.cell, cell.getContext())
  const visibleCells = row.getVisibleCells()
  const showCollapseIcon = enableCollapse && visibleCells[visibleCells.length - 1]?.id === cell.id
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
