import { useMemo } from 'react'
import type { Theme } from '@mui/material/styles'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { borderStyle } from '@ui/utils/mui'
import { EXTRA_COLUMN_PADDING, getAlignment } from '../data-table.utils'

const { Spacing } = SizesAndSpaces

const emptyObject = {}

/**
 * Creates the styles for the table cell, including handling sticky columns and collapse icon.
 * @param columnType the column's alignment type
 * @param showCollapseIcon whether to show the collapse icon (for mobile last column)
 * @param isSticky whether the column is sticky (first column on tablet)
 * @returns an array with the cell sx and the wrapper sx (empty object if no wrapper needed)
 */
export function useCellSx({
  columnType,
  showCollapseIcon,
  isSticky,
}: {
  columnType?: Parameters<typeof getAlignment>[0]
  showCollapseIcon?: boolean
  isSticky: boolean
}) {
  // with the collapse icon there is an extra wrapper, so keep the sx separate
  const textAlign = getAlignment(columnType)
  const wrapperSx = useMemo(() => ({ textAlign, paddingInline: Spacing.sm }), [textAlign])

  const sx = useMemo(
    () => ({
      ...(!showCollapseIcon && wrapperSx),
      ...EXTRA_COLUMN_PADDING,
      ...(isSticky && {
        borderInlineEnd: borderStyle,
        position: 'sticky',
        left: 0,
        zIndex: (t: Theme) => t.zIndex.tableStickyColumn,
        backgroundColor: (t: Theme) => t.design.Table.Row.Default,
      }),
    }),
    [isSticky, showCollapseIcon, wrapperSx],
  )
  return [sx, showCollapseIcon ? wrapperSx : emptyObject]
}
