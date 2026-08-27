import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { QueryProp } from '@evm-ui/types/util'
import type { PartialRecord } from '@primitives/objects.utils'
import {
  columnFacetingFeature,
  columnFilteringFeature,
  columnVisibilityFeature,
  createFacetedMinMaxValues,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  createTableHook,
  globalFilteringFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  tableFeatures,
  tableOptions,
  type Column,
  type RowData,
  type RowModel,
  type Table,
  type TableFeatures,
  type TableMeta,
  type TableOptions,
} from '@tanstack/react-table'

const { Spacing, Sizing } = SizesAndSpaces

/** css class to hide elements on desktop unless the row is hovered */
export const DESKTOP_ONLY_HOVER_CLASS = 'desktop-only-on-hover'

/** css class to make elements clickable in a row and ignore the row click */
export const CLICKABLE_IN_ROW_CLASS = 'clickable-in-row'

/** css class for secondary text inside data table rows */
export const TABLE_SECONDARY_TEXT_CLASS = 'table-secondary-text'

/** Select a table-specific faceting strategy, falling back to TanStack's standard implementation. */
const createDispatchedFacetedRowModel = <TFeatures extends TableFeatures, TData extends RowData>(
  table: Table<TFeatures, TData>,
  columnId: string,
): (() => RowModel<TFeatures, TData>) => {
  // This fixed feature set intentionally omits the type-only `tableMeta` slot, so the global generic augmentation wins.
  const override = (table.options.meta as TableMeta<TFeatures, TData> | undefined)?.facetedRowModelFactory
  return override ? override(table, columnId) : createFacetedRowModel<TFeatures, TData>()(table, columnId)
}

/** Static feature set shared by every Curve DataTable. */
const features = tableFeatures({
  columnVisibilityFeature,
  columnFilteringFeature,
  globalFilteringFeature,
  columnFacetingFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  facetedRowModel: createDispatchedFacetedRowModel,
  facetedUniqueValues: createFacetedUniqueValues(),
  facetedMinMaxValues: createFacetedMinMaxValues(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    text: sortFn_text,
  },
})

const options = tableOptions({
  features,
  getRowCanExpand: () => true, // Curve renders expanded content as sibling detail rows with its own expansion check, not TanStack subRows.
  autoResetPageIndex: false, // autoreset causes stack-too-deep errors when receiving new data
  maxMultiSortColCount: 3, // allow three columns to be sorted while holding shift
})

const { createAppColumnHelper, useAppTable } = createTableHook(options)

export { createAppColumnHelper }

export type CurveTableFeatures = typeof features
export type CurveTableItem = { url?: string | null }

const EMPTY_ARRAY: never[] = []

/** Query-aware wrapper around the Curve app table hook. */
export const useCurveTable = <TData extends RowData>(
  options: Omit<TableOptions<CurveTableFeatures, TData>, 'data' | 'features'> & {
    query: QueryProp<TData[]>
  },
) => {
  const { query, ...tableOptions } = options
  const table = useAppTable({ ...tableOptions, data: query.data ?? EMPTY_ARRAY })
  return { ...table, isLoading: query.isLoading, error: query.error }
}

/** Define the alignment of the data or header cell based on the column type. */
export const getAlignment = <TData extends RowData>({ columnDef }: Column<CurveTableFeatures, TData>) =>
  columnDef.meta?.type == 'numeric' ? 'right' : 'left'

/** Similar to `getAlignment`, but for the flex alignment. */
export const getFlexAlignment = <TData extends RowData>({ columnDef }: Column<CurveTableFeatures, TData>) =>
  columnDef.meta?.type == 'numeric' ? 'end' : 'start'

export const getExtraColumnPadding = <TData extends RowData>(column: Column<CurveTableFeatures, TData>) => {
  const visibleColumns = column.table.getVisibleLeafColumns()
  return {
    ...(visibleColumns[0]?.id === column.id && { paddingInlineStart: Spacing.md }),
    ...(visibleColumns.at(-1)?.id === column.id && { paddingInlineEnd: Spacing.md }),
  }
}

/** Get the typography variant for the cell based on the column definition. */
export const getCellVariant = <TData extends RowData>({ columnDef }: Column<CurveTableFeatures, TData>) =>
  columnDef.meta?.variant ?? 'tableCellMBold'

export const isSortedBy = <TData extends RowData>(table: Table<CurveTableFeatures, TData>, columnId: string) =>
  Boolean(table.getColumn(columnId)?.getIsSorted())

export const getHiddenCount = <TData extends RowData>(table: Table<CurveTableFeatures, TData>): number =>
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

export type FilterProps<T extends string> = {
  columnFiltersById: PartialRecord<T, string>
  setColumnFilter: (id: T, value: string | null) => void
}
