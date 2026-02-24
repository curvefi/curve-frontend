import { useMemo } from 'react'
import type { PartialRecord } from '@curvefi/primitives/objects.utils'
import type { Theme } from '@mui/material/styles'
import type { SxProps } from '@mui/system'
import {
  type Column,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { RowData, type Table, TableOptions } from '@tanstack/table-core'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

/** css class to hide elements on desktop unless the row is hovered */
export const DesktopOnlyHoverClass = 'desktop-only-on-hover'

/** css class to make elements clickable in a row and ignore the row click */
export const ClickableInRowClass = 'clickable-in-row'

/** Required fields for the data in the table. */
export type TableItem = { url?: string | null }

export type TanstackTable<T extends TableItem> = ReturnType<typeof useReactTable<T>>

/**
 * Wrapper around useReactTable to create a table instance.
 * We ignore the lint rule for now as Tanstack table isn't supported with the React compiler yet.
 * Note we don't use the compiler due to this reason, we only use the lint rules.
 */
export const useTable = <TData extends RowData>(options: TableOptions<TData>) =>
  // eslint-disable-next-line react-hooks/incompatible-library
  useReactTable<TData>(options)

/** Define the alignment of the data or header cell based on the column type. */
export const getAlignment = <T extends TableItem>({ columnDef }: Column<T>) =>
  columnDef.meta?.type == 'numeric' ? 'right' : 'left'

/** Similar to `getAlignment`, but for the flex alignment. */
export const getFlexAlignment = <T extends TableItem>({ columnDef }: Column<T>) =>
  columnDef.meta?.type == 'numeric' ? 'end' : 'start'

/**
 * In the figma design, the first and last columns seem to be aligned to the table title.
 * However, the normal padding causes them to be misaligned.
 */
export const getExtraColumnPadding = <T>(column: Column<T, unknown>) => ({
  ...(column.getIsFirstColumn() && { paddingInlineStart: Spacing.md }),
  ...(column.getIsLastColumn() && { paddingInlineEnd: Spacing.md }),
})

export type FilterProps<T extends string> = {
  columnFiltersById: PartialRecord<T, string>
  defaultFilters: { id: T; value: string }[]
  setColumnFilter: (id: T, value: string | null) => void
}

export const getTableOptions = <T>(result: T | undefined) => ({
  getCoreRowModel: getCoreRowModel<T>(),
  getSortedRowModel: getSortedRowModel<T>(),
  // only pass the filtered model once loaded, it causes an error: https://github.com/TanStack/table/issues/5026
  getFilteredRowModel: result && getFilteredRowModel<T>(),
  getExpandedRowModel: getExpandedRowModel<T>(),
  getPaginationRowModel: getPaginationRowModel<T>(),
  autoResetPageIndex: false, // autoreset causing stack too deep issues when receiving new data
  maxMultiSortColCount: 3, // allow 3 columns to be sorted at once while holding shift
})

/** Get the typography variant for the cell based on the column definition. */
export const getCellVariant = <T>({ columnDef }: Column<T>) => columnDef.meta?.variant ?? 'tableCellMBold'

const emptyObject = {} satisfies SxProps<Theme>

/**
 * Creates the styles for the table cell, including handling sticky columns and collapse icon.
 * @param column the tanstack column
 * @param showCollapseIcon whether to show the collapse icon (for mobile last column)
 * @param isSticky whether the column is sticky (first column on tablet)
 * @returns an array with the cell sx and the wrapper sx (empty object if no wrapper needed)
 */
export function useCellSx<T extends TableItem>({
  column,
  showCollapseIcon,
  isSticky,
}: {
  column: Column<T>
  showCollapseIcon?: boolean
  isSticky: boolean
}) {
  // with the collapse icon there is an extra wrapper, so keep the sx separate
  const textAlign = getAlignment(column)
  const wrapperSx = useMemo(() => ({ textAlign, paddingInline: Spacing.sm }), [textAlign])

  const { paddingInlineStart, paddingInlineEnd } = getExtraColumnPadding(column)
  const sx = useMemo(
    () => ({
      ...(!showCollapseIcon && wrapperSx),
      paddingInlineStart,
      paddingInlineEnd,
      ...(isSticky && {
        borderInlineEnd: (t: Theme) => `1px solid ${t.design.Layer[1].Outline}`,
        position: 'sticky',
        left: 0,
        zIndex: (t: Theme) => t.zIndex.tableStickyColumn,
        backgroundColor: (t: Theme) => t.design.Table.Row.Default,
      }),
      borderBlockEnd: (t: Theme) => `1px solid ${t.design.Layer[1].Outline}`,
    }),
    [isSticky, paddingInlineEnd, paddingInlineStart, showCollapseIcon, wrapperSx],
  )
  return [sx, showCollapseIcon ? wrapperSx : emptyObject]
}

export const isSortedBy = <T>(table: Table<T>, columnId: string) => table.getState().columnOrder.includes(columnId)
