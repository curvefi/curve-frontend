import { useCallback, useMemo } from 'react'
import { useUniqueDebounce } from '@ui-kit/hooks/useDebounce'
import type { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { parseRangeFilter, serializeRangeFilter } from '@ui-kit/shared/ui/DataTable/filters'
import { Range } from '@ui-kit/types/util'

export function useRangeFilter<TColumnId extends string>({
  columnFiltersById,
  setColumnFilter,
  defaultFilters,
  id,
  maxValue,
}: FilterProps<TColumnId> & { id: TColumnId; maxValue: number }) {
  const defaultRange = useMemo<Range<number>>(() => {
    const [defaultMin, defaultMax] = parseRangeFilter(defaultFilters.find((f) => f.id === id)?.value) ?? []
    return [defaultMin ?? 0, defaultMax ?? maxValue]
  }, [defaultFilters, id, maxValue])

  return useUniqueDebounce({
    // Separate default and applied range, the input's onBlur event that didn’t change anything could trigger the callback and clear the filter
    defaultValue: useMemo((): Range<number> => {
      const [minFilter, maxFilter] = parseRangeFilter(columnFiltersById[id]) ?? []
      const [defaultMin, defaultMax] = defaultRange
      return [minFilter ?? defaultMin, maxFilter ?? defaultMax]
    }, [columnFiltersById, id, defaultRange]),
    callback: useCallback(
      (newRange: Range<number>) =>
        setColumnFilter(
          id,
          serializeRangeFilter(
            newRange.map((value, i) => (value === defaultRange[i] ? null : value)) as Range<number | null>,
          ),
        ),
      [defaultRange, id, setColumnFilter],
    ),
  })
}
