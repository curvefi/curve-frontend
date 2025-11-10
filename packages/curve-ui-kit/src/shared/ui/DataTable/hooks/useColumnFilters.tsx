import { kebabCase } from 'lodash'
import { useCallback, useEffect, useMemo } from 'react'
import { notFalsy, type PartialRecord, recordValues } from '@curvefi/prices-api/objects.util'
import { useSearchParams } from '@ui-kit/hooks/router'

// Similar to `ColumnFiltersState` from react-table, but more specific to have only string values (they are saved in url)
export type ColumnFilters<TColumnId extends string> = { id: TColumnId; value: string }[]

type ColumnEnum<TColumnId extends string> = Record<string, TColumnId>

/**
 * Parse URLSearchParams into ColumnFilters, keeping only allowed keys.
 */
function parseFilters<TColumnId extends string>(
  search: URLSearchParams,
  columns: ColumnEnum<TColumnId>,
  defaultFilters: ColumnFilters<TColumnId> | undefined,
): ColumnFilters<TColumnId> {
  const allowed = new Set(recordValues(columns))
  return [
    ...(defaultFilters?.filter(({ id }) => !search.has(id)) ?? []),
    ...Array.from(search.entries())
      .filter(([key, value]) => allowed.has(key as TColumnId) && Boolean(value))
      .map(([key, value]) => ({ id: key as TColumnId, value })),
  ]
}

const setColumnFilter = <TColumnId extends string>(id: TColumnId, value: string | null) => {
  const { history, location } = window // avoid depending on the router so we can keep the function identity stable
  const params = new URLSearchParams([
    ...[...new URLSearchParams(location.search).entries()].filter(([key]) => key !== id),
    ...notFalsy(value && [id, value]),
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
}: {
  title: string
  columns: ColumnEnum<TColumnId>
  defaultFilters?: ColumnFilters<TColumnId>
}) {
  useEffect(() => {
    // remove legacy filters from local storage. This may be deleted after dec/2025
    localStorage.removeItem(`table-filters-${kebabCase(tableTitle)}`)
  }, [tableTitle])

  const searchParams = useSearchParams()
  const columnFilters = useMemo(
    () => parseFilters(searchParams, columns, defaultFilters),
    [searchParams, columns, defaultFilters],
  )

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
    const params = new URLSearchParams(searchParams)
    recordValues(columns).forEach((key) => params.delete(key))
    history.pushState(null, '', params.size ? `?${params.toString()}` : location.pathname)
  }, [columns, searchParams])

  return { columnFilters, columnFiltersById, setColumnFilter, resetFilters }
}
