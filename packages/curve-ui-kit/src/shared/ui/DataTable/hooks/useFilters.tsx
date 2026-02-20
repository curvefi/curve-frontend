import { isEqual, kebabCase } from 'lodash'
import { useCallback, useEffect, useMemo } from 'react'
import { notFalsy, type PartialRecord, recordValues } from '@curvefi/prices-api/objects.util'
import { useSearchParams } from '@ui-kit/hooks/router'

// Similar to `ColumnFiltersState` from react-table, but more specific to have only string values (they are saved in url)
export type ColumnFilters<TColumnId extends string> = { id: TColumnId; value: string }[]

type ColumnEnum<TColumnId extends string> = Record<string, TColumnId>

/** Get scoped prefix for URL keys, so we can have multiple tables on the same page without conflicts. */
const scopedPrefix = (scope: string | undefined) => (scope ? `${scope}-` : '')
/** Get scoped key for URLSearchParams */
export const scopedKey = (scope: string | undefined, columnId: string) => `${scopedPrefix(scope)}${columnId}`

/** Parse URLSearchParams into ColumnFilters, keeping only allowed keys. */
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

const setColumnFilter = <TColumnId extends string>(scope: string | undefined, id: TColumnId, value: string | null) => {
  const { history, location } = window // avoid depending on the router so we can keep the function identity stable
  const scoped = scopedKey(scope, id)
  const params = new URLSearchParams([
    ...[...new URLSearchParams(location.search).entries()].filter(([key]) => key !== scoped),
    ...notFalsy(value && [scoped, value]),
  ])
  const search = params.toString().replaceAll('%2C', ',') // keep commas unencoded for better readability
  history.pushState(null, '', params.size ? `?${search}` : location.pathname)
}

/** Manage column filters synced with the URL query string. Removes legacy localStorage on first run. */
export function useColumnFilters<TColumnId extends string>({
  columns,
  defaultFilters,
  title: tableTitle,
  scope,
}: {
  title: string
  columns: ColumnEnum<TColumnId>
  defaultFilters?: ColumnFilters<TColumnId>
  scope?: string
}) {
  useEffect(() => {
    // remove legacy filters from local storage. This may be deleted after dec/2025
    localStorage.removeItem(`table-filters-${kebabCase(tableTitle)}`)
  }, [tableTitle])

  const searchParams = useSearchParams()
  const columnFilters = useMemo(
    () => parseFilters(searchParams, columns, defaultFilters, scope),
    [searchParams, columns, defaultFilters, scope],
  )

  return {
    columnFilters,
    hasFilters: useMemo(
      () => columnFilters.length > 0 && !isEqual(columnFilters, defaultFilters),
      [columnFilters, defaultFilters],
    ),
    columnFiltersById: useMemo(
      () =>
        columnFilters.reduce(
          (acc, filter) => ({
            ...acc,
            [filter.id]: filter.value,
          }),
          {} as PartialRecord<TColumnId, string>,
        ),
      [columnFilters],
    ),
    setColumnFilter: useCallback((id: TColumnId, value: string | null) => setColumnFilter(scope, id, value), [scope]),
    resetFilters: useCallback(() => {
      const params = new URLSearchParams(searchParams)
      recordValues(columns).forEach((key) => params.delete(scopedKey(scope, key)))
      history.pushState(null, '', params.size ? `?${params.toString()}` : location.pathname)
    }, [columns, scope, searchParams]),
  }
}

const DEFAULT_SEARCH_KEY = 'search'

/**
 * Manage a global filter (free-text search) synced with the URL query string.
 * Returns the filter value, a setter, and the `globalFilterFn` to pass to `useTable`.
 *
 * @param key URL query param name. Defaults to `"search"`. Override to avoid conflicts.
 * @todo Refactor common route manipulation code together with `useColumnFilters`
 */
export function useGlobalFilter(key = DEFAULT_SEARCH_KEY) {
  const searchParams = useSearchParams()
  const globalFilter = useMemo(() => searchParams.get(key) ?? '', [searchParams, key])

  const setGlobalFilter = useCallback(
    (value: string) => {
      const { history, location } = window
      const params = new URLSearchParams(location.search)
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      const search = params.toString()
      history.pushState(null, '', params.size ? `?${search}` : location.pathname)
    },
    [key],
  )

  const resetGlobalFilter = useCallback(() => {
    const { history, location } = window
    const params = new URLSearchParams(location.search)
    params.delete(key)
    history.pushState(null, '', params.size ? `?${params.toString()}` : location.pathname)
  }, [key])

  return { globalFilter, setGlobalFilter, resetGlobalFilter }
}

/** Combines column filters and global filter into a single hook. */
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
