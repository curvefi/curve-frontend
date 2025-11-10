import { useCallback, useMemo } from 'react'
import { ColumnFiltersState } from '@tanstack/react-table'
import { useTableFilters } from '@ui-kit/hooks/useLocalStorage'
import type { MigrationOptions } from '@ui-kit/hooks/useStoredState'

const DEFAULT: ColumnFiltersState = []

/**
 * A hook to manage filters for a table. Currently saved in the state, but the URL could be a better place.
 * @param defaultFilters - The default filters to apply to the table.
 * @param title - The title of the table, used as a key fdor local storage.
 * @param migration - Migration options for the stored state.
 * @return An object containing the current filters, a mapping of filters by column ID, a function to set a filter, and a function to reset filters.
 */
export function useColumnFilters({
  title,
  migration,
  defaultFilters = DEFAULT,
}: {
  title: string
  migration: MigrationOptions<ColumnFiltersState>
  defaultFilters?: ColumnFiltersState
}) {
  const [storedFilters, setStoredFilters] = useTableFilters(title, DEFAULT, migration)
  const setColumnFilter = useCallback(
    (id: string, value: unknown) =>
      setStoredFilters((filters) => [
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
    [setStoredFilters],
  )
  const columnFilters = useMemo(() => {
    const storedIds = new Set(storedFilters.map((f) => f.id))
    return [...storedFilters, ...defaultFilters.filter((f) => !storedIds.has(f.id))]
  }, [storedFilters, defaultFilters])

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

  const resetFilters = useCallback(() => setStoredFilters(DEFAULT), [setStoredFilters])
  return { columnFilters, columnFiltersById, setColumnFilter, resetFilters }
}
