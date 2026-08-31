import { TriangleDown } from '@evm-ui/shared/icons/TriangleDown'
import { applySxProps } from '@evm-ui/utils'
import { Stack } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { type Cell, flexRender, type RowData } from '@tanstack/react-table'
import { getCellVariant, type CurveTableFeatures } from './data-table.utils'
import { useCellSx } from './hooks/useCellSx'
import { RotatableIcon } from './RotatableIcon'

export const DataCell = <TData extends RowData>({
  cell,
  enableCollapse,
  isSticky,
}: {
  cell: Cell<CurveTableFeatures, TData>
  enableCollapse: boolean
  isSticky: boolean
}) => {
  const { column, row } = cell
  const children = flexRender(column.columnDef.cell, cell.getContext())
  const showCollapseIcon = enableCollapse && row.getVisibleCells().at(-1)?.id === cell.id
  const [sx, wrapperSx] = useCellSx({ columnType: column.columnDef.meta?.type, showCollapseIcon, isSticky })
  return (
    <Typography
      variant={getCellVariant(column.columnDef.meta?.variant)}
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
