import { Stack } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { type Cell, flexRender, type RowData, Subscribe } from '@tanstack/react-table'
import { RotatableIcon } from '@ui/icons/RotatableIcon'
import { TriangleDown } from '@ui/icons/TriangleDown'
import { applySxProps } from '@ui/lib/mui'
import { getCellVariant, type CurveTableFeatures } from './data-table.utils'
import { useCellSx } from './hooks/useCellSx'

const CollapseIcon = ({ isExpanded }: { isExpanded: boolean }) => (
  <RotatableIcon
    icon={TriangleDown}
    rotated={isExpanded}
    fontSize={28}
    testId={`${isExpanded ? 'collapse' : 'expand'}-icon`}
    sx={{ color: t => t.design.Button.Ghost.Default.Label }}
  />
)

export const DataCell = <TData extends RowData>({
  cell,
  showCollapseIcon,
  isSticky,
}: {
  cell: Cell<CurveTableFeatures, TData>
  showCollapseIcon: boolean
  isSticky: boolean
}) => {
  const { column, row } = cell
  const children = flexRender(column.columnDef.cell, cell.getContext())
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
          <Subscribe source={row.table.atoms.expanded} selector={() => row.getIsExpanded()}>
            {isExpanded => <CollapseIcon isExpanded={isExpanded} />}
          </Subscribe>
        </Stack>
      ) : (
        children
      )}
    </Typography>
  )
}
