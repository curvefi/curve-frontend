import {
  type Column,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type useReactTable,
} from '@tanstack/react-table'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

/** css class to hide elements on desktop unless the row is hovered */
export const DesktopOnlyHoverClass = 'desktop-only-on-hover'

/** css class to make elements clickable in a row and ignore the row click */
export const ClickableInRowClass = 'clickable-in-row'

/** Required fields for the data in the table. */
export type TableItem = { url: string }

export type TanstackTable<T extends TableItem> = ReturnType<typeof useReactTable<T>>

/** Define the alignment of the data or header cell based on the column type. */
export const getAlignment = <T extends TableItem>({ columnDef }: Column<T>) =>
  columnDef.meta?.type == 'numeric' ? 'right' : 'left'

/** Similar to `getAlignment`, but for the flex alignment. */
export const getFlexAlignment = <T extends TableItem>({ columnDef }: Column<T>) =>
  columnDef.meta?.type == 'numeric' ? 'end' : 'start'

const { Spacing } = SizesAndSpaces

/**
 * In the figma design, the first and last columns seem to be aligned to the table title.
 * However, the normal padding causes them to be misaligned.
 */
export const getExtraColumnPadding = <T>(column: Column<T, any>) => ({
  ...(column.getIsFirstColumn() && { paddingInlineStart: Spacing.md }),
  ...(column.getIsLastColumn() && { paddingInlineEnd: Spacing.md }),
})

export type FilterProps<T extends string> = {
  columnFiltersById: Record<T, unknown>
  setColumnFilter: (id: T, value: unknown) => void
}

export const getTableOptions = <T>(result: T | undefined) => ({
  getCoreRowModel: getCoreRowModel<T>(),
  getSortedRowModel: getSortedRowModel<T>(),
  // only pass the filtered model once loaded, it causes an error: https://github.com/TanStack/table/issues/5026
  getFilteredRowModel: result && getFilteredRowModel<T>(),
  getExpandedRowModel: getExpandedRowModel<T>(),
  autoResetPageIndex: false, // autoreset causing stack too deep issues when receiving new data
  maxMultiSortColCount: 3, // allow 3 columns to be sorted at once while holding shift
})
