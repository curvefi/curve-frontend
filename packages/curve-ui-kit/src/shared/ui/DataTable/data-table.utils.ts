import { useMemo } from 'react'
import type { ReactNode } from 'react'
import type { ButtonProps } from '@mui/material/Button'
import type { Theme } from '@mui/material/styles'
import type { SxProps } from '@mui/system'
import { maybe, type PartialRecord } from '@primitives/objects.utils'
import {
  type Column,
  type ColumnDef,
  type ColumnMeta as TanstackColumnMeta,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Row,
} from '@tanstack/react-table'
import { RowData, type Table, TableOptions } from '@tanstack/table-core'
import { IncreasingLengthCategory } from '@ui-kit/hooks/useIncreasingLength'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { QueryProp } from '@ui-kit/types/util'
import { borderStyle } from '@ui-kit/utils'
import { EmptyStateCardProps } from '../EmptyStateCard'
import { EmptyStateRowSize } from './EmptyStateRow'

const { Spacing, Sizing, Height } = SizesAndSpaces

const EMPTY_ARRAY: never[] = []

/** css class to hide elements on desktop unless the row is hovered */
export const DESKTOP_ONLY_HOVER_CLASS = 'desktop-only-on-hover'

/** css class to make elements clickable in a row and ignore the row click */
export const CLICKABLE_IN_ROW_CLASS = 'clickable-in-row'

/** css class for secondary text inside data table rows */
export const TABLE_SECONDARY_TEXT_CLASS = 'table-secondary-text'

/**
 * We use `satisfies` when declaring columns, but when we want to receive that definition using ColumnDef<T, unknown>,
 * the type does not get widened, so we need to explicitly define the ColumnDefinition type as ColumnDef<T, any>.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ColumnDefinition<T> = ColumnDef<T, any>

/** Required fields for the data in the table. */
export type TableItem = { url?: string | null }

export type TanstackTable<T extends TableItem> = ReturnType<typeof useTable<T>>

export type ColumnMeta = TanstackColumnMeta<TableItem, unknown>

export type ExpandedPanelContext<T extends TableItem> = { row: Row<T>; table: Table<T> }
export type ExpandedPanelAction = Omit<ButtonProps, 'children' | 'component' | 'href' | 'ref'> & {
  id: string
  label: ReactNode
  href?: string
  testId?: string
  /** Keep this action always in the more-actions drawer */
  alwaysInKebabMenu?: boolean
}

export type ExpandedPanelActionResolver<T extends TableItem> = (
  context: ExpandedPanelContext<T>,
) => readonly ExpandedPanelAction[]

/**
 * Wrapper around useReactTable to create a table instance.
 * We ignore the lint rule for now as Tanstack table isn't supported with the React compiler yet.
 * Note we don't use the compiler due to this reason, we only use the lint rules.
 */
export const useTable = <TData extends RowData>(
  options: Omit<TableOptions<TData>, 'data'> & { query: QueryProp<TData[]> },
) => {
  const table = useReactTable<TData>({ ...options, data: options.query.data ?? EMPTY_ARRAY })
  return { ...table, isLoading: options.query.isLoading, error: options.query.error }
}

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
  setColumnFilter: (id: T, value: string | null) => void
}

/**
 * Shared TanStack row-model options for DataTable instances.
 *
 * `result` is only used as a loaded/not-loaded guard for the filtered row model.
 * `TData` must be the table row type, because TanStack row-model factories are typed against the same row shape as
 * `useTable`, `columns`, and `data`.
 */
export const getTableOptions = <TData extends RowData>(result: readonly TData[] | undefined) => ({
  getCoreRowModel: getCoreRowModel<TData>(),
  getSortedRowModel: getSortedRowModel<TData>(),
  // only pass the filtered model once loaded, it causes an error: https://github.com/TanStack/table/issues/5026
  getFilteredRowModel: maybe(result, () => getFilteredRowModel<TData>()),
  getFacetedRowModel: getFacetedRowModel<TData>(),
  getFacetedUniqueValues: getFacetedUniqueValues<TData>(),
  getFacetedMinMaxValues: getFacetedMinMaxValues<TData>(),
  getExpandedRowModel: getExpandedRowModel<TData>(),
  getPaginationRowModel: getPaginationRowModel<TData>(),
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

export type DataTableCategoryConfig = {
  size?: DataTableSize
  height?: `${number}rem` // also sets overflowY to 'auto'
  defaultVisibleRows?: number // maximum number of visible rows
  disableStickyHeader?: boolean // can also be disabled by limited rows or table width overflow.
  hideHeader?: boolean
  increasingLength?: IncreasingLengthCategory
  emptyStateSize?: NonNullable<EmptyStateCardProps['size']>
  emptyStateRowSize?: EmptyStateRowSize
}

export type DataTableCategory = keyof typeof DATA_TABLE_CATEGORIES

export const DATA_TABLE_CATEGORIES = {
  // default full-list table, e.g. LlamaMarketsTable or PoolListTable.
  list: {
    emptyStateRowSize: 'lg',
  },
  // preview table that starts with a few rows, e.g. UserPositionsMarketRateTable.
  limited: {
    defaultVisibleRows: 3,
    increasingLength: 'limited',
    emptyStateSize: 'sm',
  },
  // table with many rows constrained inside a scrollable viewport, e.g. ActivityTable or UserEventsTable.
  scrollable: {
    height: Height.table.events,
    emptyStateRowSize: 'lg',
  },
  // compact detail table inside a secondary card or advanced-details section, e.g. PoolComposition or YieldBreakdown.
  detail: {
    disableStickyHeader: true,
    increasingLength: 'disabled',
  },
  // compact form table without visible column headers, e.g. ClaimTab or ClosePositionForm.
  form: {
    disableStickyHeader: true,
    hideHeader: true,
    increasingLength: 'limited',
    emptyStateSize: 'sm',
  },
} as const satisfies Record<string, DataTableCategoryConfig>
