import { useCallback, useMemo } from 'react'
import {
  normalizeRangeFilterDefaults,
  parseRangeFilter,
  serializeRangeFilter,
} from '@evm-ui/shared/ui/DataTable/filters'
import { Range } from '@ui/features/queries/util'
import type { FilterProps } from '@ui/features/tables/data-table.utils'
import { useDebounced } from '@ui/hooks/useDebounce'

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
  const setFilter = useDebounced(setColumnFilter)
  const filterValue = useMemo((): Range<number | null> => {
    const [minFilter, maxFilter] = parseRangeFilter(columnFiltersById[id]) ?? []
    return [minFilter ?? (isLoading ? null : displayDefaultMin), maxFilter ?? (isLoading || max == null ? null : max)]
  }, [columnFiltersById, displayDefaultMin, id, isLoading, max])
  const setFilterValue = useCallback(
    (newRange: Range<number | null>) =>
      setFilter(id, serializeRangeFilter(normalizeRangeFilterDefaults(newRange, [defaultMin, max]))),
    [defaultMin, max, id, setFilter],
  )
  return [filterValue, setFilterValue] as const
}
