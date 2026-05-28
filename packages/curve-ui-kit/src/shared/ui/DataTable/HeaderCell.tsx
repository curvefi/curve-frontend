import { useMemo } from 'react'
import type { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import type { SxProps } from '@mui/system'
import { type Column, flexRender, type Header } from '@tanstack/react-table'
import { Sortable } from '@ui-kit/shared/ui/DataTable/Sortable'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Tooltip } from '../Tooltip'
import {
  DataTableHeaderCellPaddingBlockEnd,
  DataTableHeaderCellVerticalAlign,
  getAlignment,
  getExtraColumnPadding,
  type DataTableSize,
  type TableItem,
} from './data-table.utils'

const { Spacing, Sizing } = SizesAndSpaces

function useHeaderSx<T extends TableItem>({
  isSticky,
  column,
  width,
  size,
}: {
  column: Column<T>
  isSticky: boolean
  width?: string | number
  size: DataTableSize
}) {
  const { paddingInlineStart, paddingInlineEnd } = getExtraColumnPadding(column)
  const canSort = column.getCanSort()
  const textAlign = getAlignment(column)
  const isSorted = column.getIsSorted()
  return useMemo(
    (): SxProps<Theme> => ({
      textAlign,
      verticalAlign: DataTableHeaderCellVerticalAlign[size],
      color: t => t.design.Table.Header['Label_&_icon'][isSorted ? 'Active' : 'Default'],
      paddingBlockStart: 0,
      paddingBlockEnd: DataTableHeaderCellPaddingBlockEnd[size],
      paddingInline: Spacing.xs,
      paddingInlineStart,
      paddingInlineEnd,
      ...(canSort && {
        cursor: 'pointer',
        '&:hover': {
          color: t => t.design.Table.Header['Label_&_icon'].Hover,
        },
      }),
      ...(isSticky && {
        position: 'sticky',
        left: 0,
        zIndex: (t: Theme) => t.zIndex.tableHeaderStickyColumn,
        backgroundColor: (t: Theme) => t.design.Table.Header.Fill,
        borderRight: (t: Theme) => `1px solid ${t.design.Layer[1].Outline}`,
      }),
      width,
      minWidth: Sizing['3xl'],
    }),
    [canSort, isSorted, isSticky, paddingInlineEnd, paddingInlineStart, size, textAlign, width],
  )
}

export const HeaderCell = function <T extends TableItem>({
  header,
  isSticky,
  width,
  size,
}: {
  header: Header<T, unknown>
  isSticky: boolean
  width?: string | number
  size: DataTableSize
}) {
  const { column } = header
  const { tooltip } = column.columnDef.meta ?? {}
  return (
    <Typography
      component="th"
      sx={useHeaderSx({ column, isSticky, width, size })}
      colSpan={header.colSpan}
      onClick={column.getToggleSortingHandler()}
      data-testid={`data-table-header-${column.id}`}
      variant="tableHeaderS"
    >
      <Tooltip title={tooltip?.title} {...tooltip}>
        <Sortable column={column} size={size} isEnabled={column.getCanSort()}>
          {flexRender(column.columnDef.header, header.getContext())}
        </Sortable>
      </Tooltip>
    </Typography>
  )
}
