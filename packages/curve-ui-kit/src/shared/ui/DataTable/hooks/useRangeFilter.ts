import { useCallback, useMemo } from 'react'
import { useUniqueDebounce } from '@ui-kit/hooks/useDebounce'
import type { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import {
  normalizeRangeFilterDefaults,
  parseRangeFilter,
  serializeRangeFilter,
} from '@ui-kit/shared/ui/DataTable/filters'
import { Range } from '@ui-kit/types/util'

export const useRangeFilter = <TColumnId extends string>({
  debounceMs,
  displayDefaultMax,
  displayDefaultMin,
  defaultMax,
  defaultMin,
  isLoading = false,
  columnFiltersById,
  setColumnFilter,
  id,
  min = 0,
  max,
}: FilterProps<TColumnId> & {
  debounceMs?: number
  displayDefaultMin?: number | null
  displayDefaultMax?: number | null
  defaultMin?: number | null
  defaultMax?: number | null
  id: TColumnId
  min?: number
  max?: number
  isLoading?: boolean
}) => {
  const filterDefaults = useMemo(
    (): Range<number | null | undefined> => [
      defaultMin === undefined ? min : defaultMin,
      defaultMax === undefined ? max : defaultMax,
    ],
    [defaultMax, defaultMin, min, max],
  )
  const displayDefaults = useMemo(
    (): Range<number | null | undefined> => [
      displayDefaultMin === undefined ? filterDefaults[0] : displayDefaultMin,
      displayDefaultMax === undefined ? filterDefaults[1] : displayDefaultMax,
    ],
    [displayDefaultMax, displayDefaultMin, filterDefaults],
  )
  const getDisplayRange = useCallback(
    ([rangeMin, rangeMax]: Range<number | null>): Range<number | null> => {
      const [defaultMin, defaultMax] = displayDefaults

      return [
        rangeMin ?? (isLoading ? null : (defaultMin ?? null)),
        rangeMax ?? (isLoading ? null : (defaultMax ?? null)),
      ]
    },
    [displayDefaults, isLoading],
  )

  return useUniqueDebounce({
    // Separate default and applied range, the input's onBlur event that didn't change anything could trigger the callback and clear the filter.
    defaultValue: useMemo(
      (): Range<number | null> => getDisplayRange(parseRangeFilter(columnFiltersById[id]) ?? [null, null]),
      [columnFiltersById, getDisplayRange, id],
    ),
    callback: useCallback(
      (newRange: Range<number | null>) =>
        setColumnFilter(id, serializeRangeFilter(normalizeRangeFilterDefaults(newRange, filterDefaults))),
      [filterDefaults, id, setColumnFilter],
    ),
    debounceMs,
    sanitize: getDisplayRange,
  })
}
