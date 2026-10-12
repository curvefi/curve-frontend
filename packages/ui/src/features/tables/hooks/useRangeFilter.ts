import { useCallback, useMemo } from 'react'
import { Range } from '@ui/features/queries/util'
import type { FilterProps } from '@ui/features/tables/data-table.utils'
import { normalizeRangeFilterDefaults, parseRangeFilter, serializeRangeFilter } from '@ui/features/tables/filters'
import { useDebounce } from '@ui/hooks/useDebounce'

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
  const serializedFilter = columnFiltersById[id]
  const initialValue = useMemo((): Range<number | null> => {
    const [minFilter, maxFilter] = parseRangeFilter(serializedFilter) ?? []
    return [minFilter ?? (isLoading ? null : displayDefaultMin), maxFilter ?? (isLoading || max == null ? null : max)]
  }, [serializedFilter, displayDefaultMin, isLoading, max])
  const callback = useCallback(
    (newRange: Range<number | null>) =>
      setColumnFilter(id, serializeRangeFilter(normalizeRangeFilterDefaults(newRange, [defaultMin, max]))),
    [defaultMin, max, id, setColumnFilter],
  )
  // Keep the input draft current during parent rerenders; only debounce the committed filter.
  return useDebounce({ initialValue, callback })
}
