import { useMemo } from 'react'
import { Sortable } from '@evm-ui/shared/ui/DataTable/Sortable'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { borderStyle } from '@evm-ui/utils'
import type { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import type { SxProps } from '@mui/system'
import { flexRender, type Header, type RowData } from '@tanstack/react-table'
import { Tooltip } from '../Tooltip'
import { type CurveTableFeatures, getAlignment, type DataTableSize, EXTRA_COLUMN_PADDING } from './data-table.utils'

const { Spacing, Sizing } = SizesAndSpaces

const HeaderCellPaddingBlockEnd = {
  extraSmall: 0,
  small: 0,
  medium: Spacing.sm,
  large: Spacing.sm,
}

const HeaderCellVerticalAlign = {
  extraSmall: 'middle',
  small: 'middle',
  medium: 'bottom',
  large: 'bottom',
}

function useHeaderSx({
  canSort,
  columnType,
  isSorted,
  isSticky,
  width,
  size,
}: {
  canSort: boolean
  columnType?: Parameters<typeof getAlignment>[0]
  isSorted: boolean
  isSticky: boolean
  width?: string | number
  size: DataTableSize
}) {
  const textAlign = getAlignment(columnType)
  return useMemo(
    (): SxProps<Theme> => ({
      textAlign,
      verticalAlign: HeaderCellVerticalAlign[size],
      color: t => t.design.Table.Header['Label_&_icon'][isSorted ? 'Active' : 'Default'],
      paddingBlockStart: 0,
      paddingBlockEnd: HeaderCellPaddingBlockEnd[size],
      paddingInline: Spacing.xs,
      ...EXTRA_COLUMN_PADDING,
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
        borderRight: borderStyle,
      }),
      width,
      minWidth: Sizing['3xl'],
    }),
    [canSort, isSorted, isSticky, size, textAlign, width],
  )
}

export const HeaderCell = function <TData extends RowData>({
  header,
  isSticky,
  width,
  size,
}: {
  header: Header<CurveTableFeatures, TData>
  isSticky: boolean
  width?: string | number
  size: DataTableSize
}) {
  const { column } = header
  const { tooltip } = column.columnDef.meta ?? {}
  const canSort = column.getCanSort()
  const isSorted = !!column.getIsSorted()
  return (
    <Typography
      component="th"
      sx={useHeaderSx({
        canSort,
        columnType: column.columnDef.meta?.type,
        isSorted,
        isSticky,
        width,
        size,
      })}
      colSpan={header.colSpan}
      onClick={column.getToggleSortingHandler()}
      data-testid={`data-table-header-${column.id}`}
      variant="tableHeaderS"
    >
      <Tooltip title={tooltip?.title} {...tooltip}>
        <Sortable column={column} size={size} isEnabled={canSort}>
          {flexRender(column.columnDef.header, header.getContext())}
        </Sortable>
      </Tooltip>
    </Typography>
  )
}
