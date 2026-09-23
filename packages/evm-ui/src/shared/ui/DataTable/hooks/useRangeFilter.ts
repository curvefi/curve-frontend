import { useCallback, useMemo } from 'react'
import {
  normalizeRangeFilterDefaults,
  parseRangeFilter,
  serializeRangeFilter,
} from '@evm-ui/shared/ui/DataTable/filters'
import type { Nullish } from '@primitives/objects.utils'
import { Range } from '@ui/features/queries/util'
import type { FilterProps } from '@ui/features/tables/data-table.utils'
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
  const filterDefaults = useMemo((): Range<number | Nullish> => [defaultMin, max], [defaultMin, max])

  const defaultValue = useMemo((): Range<number | null> => {
    const [minFilter, maxFilter] = parseRangeFilter(columnFiltersById[id]) ?? []
    return [minFilter ?? (isLoading ? null : displayDefaultMin), maxFilter ?? (isLoading || max == null ? null : max)]
  }, [columnFiltersById, displayDefaultMin, id, isLoading, max])

  return useDebounce({
    initialValue: defaultValue,
    callback: useCallback(
      (newRange: Range<number | null>) => {
        const filter = serializeRangeFilter(normalizeRangeFilterDefaults(newRange, filterDefaults))
        // An unchanged blur must not clear the current filter.
        if (filter !== columnFiltersById[id]) setColumnFilter(id, filter)
      },
      [columnFiltersById, filterDefaults, id, setColumnFilter],
    ),
  })
}
