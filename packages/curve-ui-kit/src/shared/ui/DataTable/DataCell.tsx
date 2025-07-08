import { Stack } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { type Cell, flexRender } from '@tanstack/react-table'
import { ChevronDownIcon } from '@ui-kit/shared/icons/ChevronDownIcon'
import { RotatableIcon } from '@ui-kit/shared/ui/DataTable/RotatableIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { getAlignment, getExtraColumnPadding, type TableItem } from './data-table.utils'

const { Spacing } = SizesAndSpaces

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
  const { variant, borderRight } = column.columnDef.meta ?? {}
  const children = flexRender(column.columnDef.cell, cell.getContext())

  // with the collapse icon there is an extra wrapper, so keep the sx separate
  const wrapperSx = {
    textAlign: getAlignment(column),
    paddingInline: Spacing.sm,
    // 1px less for the border bottom
    // paddingBlock: mapValues({ ...Spacing.xs, mobile: Spacing.md.mobile }, (value) => `${value} calc(${value} - 1px)`),
  }

  const showCollapseIcon = isMobile && column.getIsLastColumn()
  return (
    <Typography
      variant={variant ?? 'tableCellMBold'}
      color="text.primary"
      component="td"
      sx={{
        ...(!showCollapseIcon && wrapperSx),
        ...getExtraColumnPadding(column),
        ...((borderRight || isSticky) && { borderRight: t => `1px solid ${t.design.Layer[1].Outline}` }),
        ...(isSticky && {
          position: 'sticky',
          left: 0,
          zIndex: t => t.zIndex.tableStickyColumn,
          backgroundColor: t => t.design.Table.Row.Default,
        }),
        borderBlockEnd: t => `1px solid ${t.design.Layer[1].Outline}`,
      }}
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
