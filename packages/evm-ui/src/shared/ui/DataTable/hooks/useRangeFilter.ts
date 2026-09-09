import { useCallback, useMemo } from 'react'
import {
  normalizeRangeFilterDefaults,
  parseRangeFilter,
  serializeRangeFilter,
} from '@evm-ui/shared/ui/DataTable/filters'
import { Range } from '@ui/features/queries/util'
import type { FilterProps } from '@ui/features/tables/data-table.utils'
import { useUniqueDebounce } from '@ui/hooks/useDebounce'

export const useRangeFilter = <TColumnId extends string>({
  isLoading = false,
  columnFiltersById,
  setColumnFilter,
  id,
  min = 0,
  max,
  defaultMin = min,
  displayDefaultMin = defaultMin,
}: FilterProps<TColumnId> & {
  displayDefaultMin?: number | null
  defaultMin?: number | null
  id: TColumnId
  min?: number
  max?: number
  isLoading?: boolean
}) => {
  const filterDefaults = useMemo((): Range<number | null | undefined> => [defaultMin, max], [defaultMin, max])

  return useUniqueDebounce({
    // Separate default and applied range, the input's onBlur event that didn't change anything could trigger the callback and clear the filter.
    defaultValue: useMemo((): Range<number | null> => {
      const [minFilter, maxFilter] = parseRangeFilter(columnFiltersById[id]) ?? []
      return [minFilter ?? (isLoading ? null : displayDefaultMin), maxFilter ?? (isLoading || max == null ? null : max)]
    }, [columnFiltersById, displayDefaultMin, id, isLoading, max]),
    callback: useCallback(
      (newRange: Range<number | null>) =>
        setColumnFilter(id, serializeRangeFilter(normalizeRangeFilterDefaults(newRange, filterDefaults))),
      [filterDefaults, id, setColumnFilter],
    ),
  })
}
