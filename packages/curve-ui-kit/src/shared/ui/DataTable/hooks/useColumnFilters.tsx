import { kebabCase } from 'lodash'
import { useCallback, useEffect, useMemo } from 'react'
import { notFalsy, type PartialRecord, recordValues } from '@curvefi/prices-api/objects.util'
import { useSearchParams } from '@ui-kit/hooks/router'

// Similar to `ColumnFiltersState` from react-table, but more specific to have only string values (they are saved in url)
export type ColumnFilters<TColumnId extends string> = { id: TColumnId; value: string }[]

type ColumnEnum<TColumnId extends string> = Record<string, TColumnId>

const scopedPrefix = (scope: string | undefined) => (scope ? `${scope}-` : undefined)
const scopedKey = (scope: string | undefined, id: string) => (scope ? `${scopedPrefix(scope)}${id}` : id)
/**
 * Parse URLSearchParams into ColumnFilters, keeping only allowed keys.
 */
function parseFilters<TColumnId extends string>(
  search: URLSearchParams,
  columns: ColumnEnum<TColumnId>,
  defaultFilters: ColumnFilters<TColumnId> | undefined,
  scope?: string,
): ColumnFilters<TColumnId> {
  const allowed = new Set(recordValues(columns))
  const filterPrefix = scopedPrefix(scope)
  return [
    ...(defaultFilters?.filter(({ id }) => !search.has(scopedKey(scope, id))) ?? []),
    ...Array.from(search.entries())
      .filter(([key, value]) => {
        if (!value) return false
        const columnId = filterPrefix ? (key.startsWith(filterPrefix) ? key.slice(filterPrefix.length) : null) : key
        if (columnId === null) return false
        return allowed.has(columnId as TColumnId)
      })
      .map(([key, value]) => {
        const columnId = (filterPrefix ? key.slice(filterPrefix.length) : key) as TColumnId
        return { id: columnId, value }
      }),
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

/**
 * Manage column filters synced with the URL query string. Removes legacy localStorage on first run.
 */
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
