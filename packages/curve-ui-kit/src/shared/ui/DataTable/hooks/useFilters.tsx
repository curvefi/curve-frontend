import { isEqual } from 'lodash'
import { useCallback, useMemo } from 'react'
import { fromEntries, recordValues } from '@curvefi/primitives/objects.utils'
import { useSearchParams } from '@ui-kit/hooks/router'

/**
 * Similar to `ColumnFiltersState` from react-table, but restricted to string values
 * so filters can be safely serialized into URL query parameters.
 */
type ColumnFilters<TColumnId extends string> = { id: TColumnId; value: string }[]

/** Maps display names to column ID strings for a given table. */
type ColumnEnum<TColumnId extends string> = Record<string, TColumnId>

/** Get scoped prefix for URL keys, so we can have multiple tables on the same page without conflicts. */
const scopedPrefix = (scope: string | undefined) => (scope ? `${scope}-` : '')
/** Get scoped key for URLSearchParams */
const scopedKey = (scope: string | undefined, columnId: string) => `${scopedPrefix(scope)}${columnId}`

/**
 * Updates the browser history with new URL query parameters.
 * Removes keys mapped to `null`. Keeps commas unencoded for readability.
 * Uses `window.history` directly to remain router-agnostic and keep a stable function identity.
 *
 * @param updates A record of key-value pairs to set, or `null` to delete a key.
 */
const updateSearchParams = (updates: Record<string, string | null>) => {
  const { history, location } = window // avoid depending on the router so we can keep the function identity stable
  const params = new URLSearchParams(location.search)
  Object.entries(updates).forEach(([key, value]) => (value === null ? params.delete(key) : params.set(key, value)))
  const search = params.toString().replaceAll('%2C', ',') // keep commas unencoded for better readability
  history.replaceState(null, '', params.size ? `?${search}` : location.pathname)
}

/**
 * Parses URLSearchParams into a typed `ColumnFilters` array.
 * Only entries whose keys match an allowed column ID (optionally scoped) are included.
 * Default filters are prepended for any column not already present in the URL.
 *
 * @param search The current URLSearchParams from the browser location.
 * @param columns Enum-like record mapping names to valid column IDs.
 * @param defaultFilters Fallback filters applied when a column has no URL value.
 * @param scope Optional prefix to namespace URL keys for this table instance.
 */
function parseFilters<TColumnId extends string>(
  search: URLSearchParams,
  columns: ColumnEnum<TColumnId>,
  defaultFilters: ColumnFilters<TColumnId> | undefined,
  scope?: string,
): ColumnFilters<TColumnId> {
  const allowed = new Set(recordValues(columns).map((id) => scopedKey(scope, id)))
  const filterPrefix = scopedPrefix(scope)
  return [
    ...(defaultFilters?.filter(({ id }) => !search.has(scopedKey(scope, id))) ?? []),
    ...Array.from(search.entries())
      .filter(([key, value]) => value && allowed.has(key))
      .map(([key, value]) => ({ id: key.slice(filterPrefix.length) as TColumnId, value })),
  ]
}

const empty: never[] = []

/**
 * Manages per-column filters that are synced with URL query parameters.
 *
 * @param columns Enum-like record of valid column IDs for this table.
 * @param defaultFilters Filters applied when a column has no corresponding URL param.
 * @param scope Optional namespace prefix to avoid URL key collisions across tables.
 */
function useColumnFilters<TColumnId extends string>({
  columns,
  defaultFilters = empty,
  scope,
}: {
  columns: ColumnEnum<TColumnId>
  defaultFilters?: ColumnFilters<TColumnId>
  scope?: string
}) {
  const searchParams = useSearchParams()
  const columnFilters = useMemo(
    () => parseFilters(searchParams, columns, defaultFilters, scope),
    [searchParams, columns, defaultFilters, scope],
  )

  return {
    columnFilters,
    defaultFilters,
    hasFilters: useMemo(
      () => columnFilters.length > 0 && !isEqual(columnFilters, defaultFilters),
      [columnFilters, defaultFilters],
    ),
    columnFiltersById: useMemo(() => fromEntries(columnFilters.map((f) => [f.id, f.value])), [columnFilters]),
    setColumnFilter: useCallback(
      (id: TColumnId, value: string | null) => updateSearchParams({ [scopedKey(scope, id)]: value }),
      [scope],
    ),
    resetFilters: useCallback(() => {
      updateSearchParams(Object.fromEntries(recordValues(columns).map((key) => [scopedKey(scope, key), null])))
    }, [columns, scope]),
  }
}

const DEFAULT_SEARCH_KEY = 'search'

/**
 * Manages a global free-text search filter synced with the URL query string.
 * Returns the filter value, a setter, and a reset function.
 *
 * @param key URL query parameter name. Defaults to `"search"`. Override to avoid conflicts with other filters.
 */
function useGlobalFilter(key = DEFAULT_SEARCH_KEY) {
  const searchParams = useSearchParams()
  const globalFilter = useMemo(() => searchParams.get(key) ?? '', [searchParams, key])

  const setGlobalFilter = useCallback((value: string) => updateSearchParams({ [key]: value || null }), [key])
  const resetGlobalFilter = useCallback(() => updateSearchParams({ [key]: null }), [key])

  return { globalFilter, setGlobalFilter, resetGlobalFilter }
}

/**
 * Combines {@link useColumnFilters} and {@link useGlobalFilter} into a single hook
 * for tables that need both per-column and free-text filtering, all synced with the URL.
 *
 * @param searchKey URL query parameter name for the global search. Defaults to `"search"`.
 * @param columnFilterOptions - All options accepted by {@link useColumnFilters}.
 */
export const useFilters = <TColumnId extends string>({
  searchKey,
  ...columnFilterOptions
}: Parameters<typeof useColumnFilters<TColumnId>>[0] & { searchKey?: string }) => {
  const { resetGlobalFilter, ...globalFilter } = useGlobalFilter(searchKey)
  const { resetFilters: resetColumnFilters, ...columnFilters } = useColumnFilters(columnFilterOptions)

  const resetFilters = useCallback(() => {
    resetGlobalFilter()
    resetColumnFilters()
  }, [resetColumnFilters, resetGlobalFilter])

  return {
    ...globalFilter,
    ...columnFilters,
    resetGlobalFilter,
    resetColumnFilters,
    resetFilters,
  }
}
