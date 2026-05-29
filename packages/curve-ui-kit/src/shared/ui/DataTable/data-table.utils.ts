import { useMemo } from 'react'
import type { Theme } from '@mui/material/styles'
import type { SxProps } from '@mui/system'
import type { PartialRecord } from '@primitives/objects.utils'
import {
  type Column,
  type ColumnDef,
  type ColumnMeta as TanstackColumnMeta,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { RowData, type Table, TableOptions } from '@tanstack/table-core'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { borderStyle } from '@ui-kit/utils'

const { Spacing, Sizing } = SizesAndSpaces

/** css class to hide elements on desktop unless the row is hovered */
export const DesktopOnlyHoverClass = 'desktop-only-on-hover'

/** css class to make elements clickable in a row and ignore the row click */
export const ClickableInRowClass = 'clickable-in-row'

/** css class for secondary text inside data table rows */
export const TableSecondaryTextClass = 'table-secondary-text'

/**
 * We use `satisfies` when declaring columns, but when we want to receive that definition using ColumnDef<T, unknown>,
 * the type does not get widened, so we need to explicitly define the ColumnDefinition type as ColumnDef<T, any>.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ColumnDefinition<T> = ColumnDef<T, any>

/** Required fields for the data in the table. */
export interface TableItem { url?: string | null }

export type TanstackTable<T extends TableItem> = ReturnType<typeof useReactTable<T>>

export type ColumnMeta = TanstackColumnMeta<TableItem, unknown>

/**
 * Wrapper around useReactTable to create a table instance.
 * We ignore the lint rule for now as Tanstack table isn't supported with the React compiler yet.
 * Note we don't use the compiler due to this reason, we only use the lint rules.
 */
export const useTable = <TData extends RowData>(options: TableOptions<TData>) => useReactTable<TData>(options)

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

export interface FilterProps<T extends string> {
  columnFiltersById: PartialRecord<T, string>
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
        borderInlineEnd: borderStyle,
        position: 'sticky',
        left: 0,
        zIndex: (t: Theme) => t.zIndex.tableStickyColumn,
        backgroundColor: (t: Theme) => t.design.Table.Row.Default,
      }),
      borderBlockEnd: borderStyle,
    }),
    [isSticky, paddingInlineEnd, paddingInlineStart, showCollapseIcon, wrapperSx],
  )
  return [sx, showCollapseIcon ? wrapperSx : emptyObject]
}

export const isSortedBy = <T>(table: Table<T>, columnId: string) => table.getState().columnOrder.includes(columnId)

export const getHiddenCount = <T>(table: Table<T>): number =>
  table.getPreFilteredRowModel().rows.length - table.getFilteredRowModel().rows.length

// The following datatable size code lives in the util file, because at the moment of writing we have both DataTable and LegacyDataTable.
// TODO: move to the final DataTable.tsx component once we remove the LegacyDataTable and make sure there are no circular dependencies with the other files in the DataTable folder.
export type DataTableSize = 'extraSmall' | 'small' | 'medium' | 'large'

export const DataTableHeaderHeight = {
  extraSmall: Sizing.sm,
  small: Sizing.md,
  medium: Sizing.lg,
  large: Sizing.xxl,
} as const

export const DataTableHeaderCellPaddingBlockEnd = {
  extraSmall: 0,
  small: 0,
  medium: Spacing.sm,
  large: Spacing.sm,
}

export const DataTableHeaderCellVerticalAlign = {
  extraSmall: 'middle',
  small: 'middle',
  medium: 'bottom',
  large: 'bottom',
}

export const DataTableHeaderCellSortableAlign = {
  extraSmall: 'center',
  small: 'center',
  medium: 'end',
  large: 'end',
}
