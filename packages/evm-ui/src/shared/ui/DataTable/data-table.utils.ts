import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import type { TypographyVariantKey } from '@evm-ui/themes/typography'
import { QueryProp } from '@evm-ui/types/util'
import { maybe, type PartialRecord } from '@primitives/objects.utils'
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
  filterFn_includesString,
  globalFilteringFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  tableFeatures,
  tableOptions,
  type RowData,
  type RowModel,
  type Table,
  type TableFeatures,
  type TableMeta,
  type TableOptions,
} from '@tanstack/react-table'
import { column_getIsSorted } from '@tanstack/react-table/static-functions'

const { Sizing, Spacing } = SizesAndSpaces

/** css class to hide elements on desktop unless the row is hovered */
export const DESKTOP_ONLY_HOVER_CLASS = 'desktop-only-on-hover'

/** css class to make elements clickable in a row and ignore the row click */
export const CLICKABLE_IN_ROW_CLASS = 'clickable-in-row'

/** css class for secondary text inside data table rows */
export const TABLE_SECONDARY_TEXT_CLASS = 'table-secondary-text'

export const EXTRA_COLUMN_PADDING = {
  '&:first-child': { paddingInlineStart: Spacing.md },
  '&:last-child': { paddingInlineEnd: Spacing.md },
}

/** Builds the rows used to calculate a column's filter choices. Markets override this so their choices only depend on selected chains. */
const createCustomFacetedRowModel = <TFeatures extends TableFeatures, TData extends RowData>(
  table: Table<TFeatures, TData>,
  columnId: string,
): (() => RowModel<TFeatures, TData>) =>
  maybe((table.options.meta as TableMeta<TFeatures, TData> | undefined)?.facetedRowModelFactory, factory =>
    factory(table, columnId),
  ) ?? createFacetedRowModel<TFeatures, TData>()(table, columnId)

/**
 * Static feature set availabled for every the Curve app table. App tables are new in v9 and use a global set of features and options,
 * kinda how we already used Tanstack Table v8. Technically it's possible for each table to have its own feature set and options for
 * better tree-shaking, but it's a bit unpractical for the time being.
 */
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
  facetedRowModel: createCustomFacetedRowModel,
  facetedUniqueValues: createFacetedUniqueValues(),
  facetedMinMaxValues: createFacetedMinMaxValues(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    text: sortFn_text,
  },
})

export type CurveTableFeatures = typeof features

const options = tableOptions({
  features,
  getRowCanExpand: () => true, // expanded panels are generic sibling rows with their own 'can expand' check; subRows are tied to the column layout (which means you can't show just *any* generic panel component)
  autoResetPageIndex: false, // autoreset causes stack-too-deep errors when receiving new data
  autoResetExpanded: false, // very annoying to have rows collapsed when searching or Merkl data comes in
  maxMultiSortColCount: 3, // allow three columns to be sorted while holding shift
})

const { createAppColumnHelper, useAppTable } = createTableHook(options)
export { createAppColumnHelper }

const EMPTY_ARRAY: never[] = []

/** Query-aware wrapper around the Curve app table hook. */
export const useCurveTable = <TData extends RowData>({
  query: { data, isLoading, error },
  ...tableOptions
}: Omit<TableOptions<CurveTableFeatures, TData>, 'data' | 'features'> & {
  query: QueryProp<TData[]>
}) => ({
  ...useAppTable({ ...tableOptions, data: data ?? EMPTY_ARRAY }),
  isLoading,
  error,
})

/** Define the alignment of the data or header cell based on the column type. */
export const getAlignment = (type?: 'numeric') => (type == 'numeric' ? 'right' : 'left')

/** Get the typography variant for the cell based on the column definition. */
export const getCellVariant = (variant?: TypographyVariantKey) => variant ?? 'tableCellMBold'

export const isSortedBy = <TFeatures extends TableFeatures, TData extends RowData>(
  table: Pick<Table<TFeatures, TData>, 'getColumn'>,
  columnId: string,
) => !!maybe(table.getColumn(columnId), column_getIsSorted)

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
