import { Stack } from '@mui/material'
import Box from '@mui/material/Box'
import type { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { type Cell, type Column, flexRender } from '@tanstack/react-table'
import { ChevronDownIcon } from '@ui-kit/shared/icons/ChevronDownIcon'
import { RotatableIcon } from '@ui-kit/shared/ui/DataTable/RotatableIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { getAlignment, getExtraColumnPadding, type TableItem } from './data-table.utils'

const { Spacing } = SizesAndSpaces

export function getCellSx<T extends TableItem>({
  column,
  showCollapseIcon,
  isSticky,
}: {
  column: Column<T>
  showCollapseIcon?: boolean
  isSticky: boolean
}) {
  // with the collapse icon there is an extra wrapper, so keep the sx separate
  const wrapperSx = {
    textAlign: getAlignment(column),
    paddingInline: Spacing.sm,
  }
  const sx = {
    ...(!showCollapseIcon && wrapperSx),
    ...getExtraColumnPadding(column),
    ...(isSticky && {
      borderInlineEnd: (t: Theme) => `1px solid ${t.design.Layer[1].Outline}`,
      position: 'sticky',
      left: 0,
      zIndex: (t: Theme) => t.zIndex.tableStickyColumn,
      backgroundColor: (t: Theme) => t.design.Table.Row.Default,
    }),
    borderBlockEnd: (t: Theme) => `1px solid ${t.design.Layer[1].Outline}`,
  }
  return [sx, showCollapseIcon ? wrapperSx : {}]
}

export const getCellVariant = <T,>({ columnDef }: Column<T>) => columnDef.meta?.variant ?? 'tableCellMBold'

/**
 * DataCell component to render the data cell in the table.
 */
export const DataCell = <T extends TableItem>({
  cell,
  isMobile,
  isSticky,
}: {
  cell: Cell<T, unknown>
  isMobile: boolean
  isSticky: boolean
}) => {
  const { column, row } = cell
  const children = flexRender(column.columnDef.cell, cell.getContext())
  const showCollapseIcon = isMobile && column.getIsLastColumn()
  const [sx, wrapperSx] = getCellSx({ column, showCollapseIcon, isSticky })
  return (
    <Typography
      variant={getCellVariant(column)}
      color="text.primary"
      component="td"
      sx={sx}
      data-testid={`data-table-cell-${column.id}`}
    >
      {showCollapseIcon ? (
        <Stack direction="row" alignItems="center" width="100%">
          <Box sx={wrapperSx} flexGrow={1}>
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
