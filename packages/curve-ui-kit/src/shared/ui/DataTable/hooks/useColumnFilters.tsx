import { kebabCase } from 'lodash'
import { useCallback, useEffect, useMemo } from 'react'
import { type PartialRecord, recordValues } from '@curvefi/prices-api/objects.util'
import { useSearchParams } from '@ui-kit/hooks/router'

// Similar to `ColumnFiltersState` from react-table, but more specific to have only string values (they are saved in url)
export type ColumnFilters<TColumnId extends string> = { id: TColumnId; value: string }[]

/**
 * Parse URLSearchParams into ColumnFilters, keeping only allowed keys.
 */
function parseFilters<TColumnId extends string>(
  search: URLSearchParams,
  keys: Record<string, TColumnId>,
): ColumnFilters<TColumnId> {
  const allowed = new Set(recordValues(keys))
  return Array.from(search.entries())
    .filter(([key, value]) => allowed.has(key as TColumnId) && Boolean(value))
    .map(([key, value]) => ({ id: key as TColumnId, value }))
}

const setColumnFilter = <TColumnId extends string>(id: TColumnId, value: string | null) => {
  const { history, location } = window // avoid depending on the router so we can keep the function identity stable
  const params = new URLSearchParams([
    ...[...new URLSearchParams(location.search).entries()].filter(([key]) => key !== id),
    ...((value ?? '') !== '' ? [[id, value!] as [string, string]] : []),
  ])
  history.pushState(null, '', params.size ? `?${params.toString()}` : location.pathname)
}

/**
 * Manage column filters synced with the URL query string. Removes legacy localStorage on first run.
 */
export function useColumnFilters<TColumnId extends string>(
  tableTitle: string,
  keys: Record<string, TColumnId>,
  defaultFilters?: ColumnFilters<TColumnId>,
) {
  useEffect(() => {
    // remove legacy filters from local storage. This may be deleted after dec/2025
    localStorage.removeItem(`table-filters-${kebabCase(tableTitle)}`)
  }, [tableTitle])

  const searchParams = useSearchParams()
  const columnFilters = useMemo(() => parseFilters(searchParams, keys), [searchParams, keys])

  const columnFiltersById: PartialRecord<TColumnId, string> = useMemo(
    () =>
      columnFilters.reduce(
        (acc, filter) => ({
          ...acc,
          [filter.id]: filter.value,
        }),
        {} as PartialRecord<TColumnId, string>,
      ),
    [columnFilters],
  )

  const resetFilters = useCallback(() => {
    const allowed = new Set(Object.values(keys) as TColumnId[])
    const params = new URLSearchParams(searchParams)
    // remove all allowed filter keys
    for (const key of allowed) params.delete(key)
    // set defaults
    defaultFilters?.forEach(({ id, value }) => params.set(id, value))
    const pathname = params.size ? `?${params.toString()}` : location.pathname
    history.pushState(null, '', pathname)
  }, [defaultFilters, keys, searchParams])

  return [columnFilters, columnFiltersById, setColumnFilter, resetFilters] as const
}
