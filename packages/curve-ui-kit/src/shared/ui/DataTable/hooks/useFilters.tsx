import { useCallback, useMemo } from 'react'
import { fromEntries, recordEntries, recordValues, type PartialRecord } from '@primitives/objects.utils'
import { useSearchNavigate, useSearchParams } from '@ui-kit/hooks/router'

/**
 * Similar to `ColumnFiltersState` from react-table, but restricted to string values
 * so filters can be safely serialized into URL query parameters.
 */
type ColumnFilters<TColumnId extends string> = { id: TColumnId; value: string }[]

type SearchParamsUpdate = Record<string, string | string[] | null>

const DEFAULT_SEARCH_KEY = 'search'
const RESET_PAGE_UPDATE: SearchParamsUpdate = { page: null }

/** Maps display names to column ID strings for a given table. */
type ColumnEnum<TColumnId extends string> = Record<string, TColumnId>

/** Get scoped prefix for URL keys, so we can have multiple tables on the same page without conflicts. */
const scopedPrefix = (scope: string | undefined) => (scope ? `${scope}-` : '')
/** Get scoped key for URLSearchParams */
const scopedKey = (scope: string | undefined, columnId: string) => `${scopedPrefix(scope)}${columnId}`

/**
 * Parses URLSearchParams into a typed `ColumnFilters` array.
 * Only entries whose keys match an allowed column ID (optionally scoped) are included.
 * Default filters are prepended for any column not already present in the URL.
 *
 * @param search The current URLSearchParams from the browser location.
 * @param columns Enum-like record mapping names to valid column IDs.
 * @param scope Optional prefix to namespace URL keys for this table instance.
 */
function parseFilters<TColumnId extends string>(
  search: URLSearchParams,
  columns: ColumnEnum<TColumnId>,
  scope?: string,
): ColumnFilters<TColumnId> {
  const allowed = new Set(recordValues(columns).map(id => scopedKey(scope, id)))
  const filterPrefix = scopedPrefix(scope)
  return Array.from(search.entries())
    .filter(([key, value]) => value && allowed.has(key))
    .map(([key, value]) => ({ id: key.slice(filterPrefix.length) as TColumnId, value }))
}

/**
 * Manages per-column filters that are synced with URL query parameters.
 *
 * @param columns Enum-like record of valid column IDs for this table.
 * @param scope Optional namespace prefix to avoid URL key collisions across tables.
 */
function useColumnFilters<TColumnId extends string>({
  columns,
  resetPageOnChange,
  scope,
}: {
  columns: ColumnEnum<TColumnId>
  resetPageOnChange?: boolean
  scope?: string
}) {
  const searchParams = useSearchParams()
  const columnFilters = useMemo(() => parseFilters(searchParams, columns, scope), [searchParams, columns, scope])
  const searchNavigate = useSearchNavigate(searchParams)
  const updateColumnFilters = useCallback(
    (filters: PartialRecord<TColumnId, string | null>) =>
      searchNavigate(
        {
          ...fromEntries(recordEntries(filters).map(([id, value]) => [scopedKey(scope, id), value])),
          ...(resetPageOnChange ? RESET_PAGE_UPDATE : {}),
        },
        { replace: true },
      ),
    [resetPageOnChange, scope, searchNavigate],
  )

  return {
    columnFilters,
    columnFiltersById: useMemo(() => fromEntries(columnFilters.map(f => [f.id, f.value])), [columnFilters]),
    setColumnFilter: useCallback(
      (id: TColumnId, value: string | null) =>
        updateColumnFilters({ [id]: value } as PartialRecord<TColumnId, string | null>),
      [updateColumnFilters],
    ),
  }
}

/**
 * Manages a global free-text search filter synced with the URL query string.
 * Returns the filter value, a setter, and a reset function.
 *
 * @param key URL query parameter name. Defaults to `"search"`. Override to avoid conflicts with other filters.
 */
function useGlobalFilter(key = DEFAULT_SEARCH_KEY, resetPageOnChange?: boolean) {
  const searchParams = useSearchParams()
  const searchNavigate = useSearchNavigate(searchParams)

  return {
    globalFilter: useMemo(() => searchParams.get(key) ?? '', [searchParams, key]),
    setGlobalFilter: useCallback(
      (value: string) =>
        searchNavigate({ [key]: value || null, ...(resetPageOnChange ? RESET_PAGE_UPDATE : {}) }, { replace: true }),
      [key, resetPageOnChange, searchNavigate],
    ),
  }
}

/**
 * Combines {@link useColumnFilters} and {@link useGlobalFilter} into a single hook
 * for tables that need both per-column and free-text filtering, all synced with the URL.
 *
 * @param searchKey URL query parameter name for the global search. Defaults to `"search"`.
 * @param resetPageOnChange Clear the page query parameter when filters change.
 * @param columnFilterOptions - All options accepted by {@link useColumnFilters}.
 */
export const useFilters = <TColumnId extends string>({
  resetPageOnChange,
  searchKey = DEFAULT_SEARCH_KEY,
  ...columnFilterOptions
}: Parameters<typeof useColumnFilters<TColumnId>>[0] & {
  searchKey?: string
}) => {
  const globalFilter = useGlobalFilter(searchKey, resetPageOnChange)
  const columnFilters = useColumnFilters({ ...columnFilterOptions, resetPageOnChange })

  const searchParams = useSearchParams()
  const searchNavigate = useSearchNavigate(searchParams)
  const { columns, scope } = columnFilterOptions

  return {
    ...globalFilter,
    ...columnFilters,
    /**
     * Clears all filters (both global search and column filters) in a single navigation.
     * Multiple navigations do not work because each one captures its own `searchNavigate`
     * closure at render time. To avoid this, `resetFilters` merges all keys into one update,
     * so only a single navigation occurs.
     */
    resetFilters: useCallback(() => {
      searchNavigate(
        {
          [searchKey]: null,
          ...Object.fromEntries(recordValues(columns).map(key => [scopedKey(scope, key), null])),
          ...(resetPageOnChange ? RESET_PAGE_UPDATE : {}),
        },
        { replace: true },
      )
    }, [resetPageOnChange, searchNavigate, searchKey, columns, scope]),
  }
}
