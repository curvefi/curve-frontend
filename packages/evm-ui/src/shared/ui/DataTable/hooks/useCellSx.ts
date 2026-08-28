import { useMemo } from 'react'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { borderStyle } from '@evm-ui/utils'
import type { Theme } from '@mui/material/styles'
import type { Column, RowData } from '@tanstack/react-table'
import { getAlignment, getExtraColumnPadding, type CurveTableFeatures } from '../data-table.utils'

const { Spacing } = SizesAndSpaces

const emptyObject = {}

/**
 * Creates the styles for the table cell, including handling sticky columns and collapse icon.
 * @param column the tanstack column
 * @param showCollapseIcon whether to show the collapse icon (for mobile last column)
 * @param isSticky whether the column is sticky (first column on tablet)
 * @returns an array with the cell sx and the wrapper sx (empty object if no wrapper needed)
 */
export function useCellSx<TData extends RowData>({
  column,
  showCollapseIcon,
  isSticky,
}: {
  column: Column<CurveTableFeatures, TData>
  showCollapseIcon?: boolean
  isSticky: boolean
}) {
  // with the collapse icon there is an extra wrapper, so keep the sx separate
  const textAlign = getAlignment(column.columnDef.meta?.type)
  const wrapperSx = useMemo(() => ({ textAlign, paddingInline: Spacing.sm }), [textAlign])

  const { paddingInlineStart, paddingInlineEnd } = getExtraColumnPadding(
    column.id,
    column.table.getVisibleLeafColumns(),
  )
  const sx = useMemo(
    () => ({
      ...(!showCollapseIcon && wrapperSx),
      paddingInlineStart,
      paddingInlineEnd,
      ...(isSticky && {
        borderInlineEnd: borderStyle,
        position: 'sticky',
        left: 0,
        zIndex: (t: Theme) => t.zIndex.tableStickyColumn,
        backgroundColor: (t: Theme) => t.design.Table.Row.Default,
      }),
    }),
    [isSticky, paddingInlineEnd, paddingInlineStart, showCollapseIcon, wrapperSx],
  )
  return [sx, showCollapseIcon ? wrapperSx : emptyObject]
}
