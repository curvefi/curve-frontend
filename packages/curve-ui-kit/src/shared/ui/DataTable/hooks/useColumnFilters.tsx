import { useCallback, useMemo } from 'react'
import { ColumnFiltersState } from '@tanstack/react-table'
import { useTableFilters } from '@ui-kit/hooks/useLocalStorage'
import type { MigrationOptions } from '@ui-kit/hooks/useStoredState'

const DEFAULT: ColumnFiltersState = []

/**
 * A hook to manage filters for a table. Currently saved in the state, but the URL could be a better place.
 */
export function useColumnFilters(
  tableTitle: string,
  migration: MigrationOptions<ColumnFiltersState>,
  defaultFilters: ColumnFiltersState = DEFAULT,
) {
  const [columnFilters, setColumnFilters] = useTableFilters(tableTitle, defaultFilters, migration)
  const setColumnFilter = useCallback(
    (id: string, value: unknown) =>
      setColumnFilters((filters) => [
        ...filters.filter((f) => f.id !== id),
        ...(value == null
          ? []
          : [
              {
                id,
                value,
              },
            ]),
      ]),
    [setColumnFilters],
  )
  const columnFiltersById: Record<string, unknown> = useMemo(
    () =>
      columnFilters.reduce(
        (acc, filter) => ({
          ...acc,
          [filter.id]: filter.value,
        }),
        {},
      ),
    [columnFilters],
  )

  const resetFilters = useCallback(() => setColumnFilters(defaultFilters), [defaultFilters, setColumnFilters])

  return [columnFilters, columnFiltersById, setColumnFilter, resetFilters] as const
}
