import { useCallback, useMemo } from 'react'
import { useUniqueDebounce } from '@ui-kit/hooks/useDebounce'
import type { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { parseRangeFilter, serializeRangeFilter } from '@ui-kit/shared/ui/DataTable/filters'
import { NumberRange } from '@ui-kit/types/util'

export function useRangeFilter<TColumnId extends string>({
  columnFiltersById,
  setColumnFilter,
  defaultFilters,
  id,
  maxValue,
}: FilterProps<TColumnId> & { id: TColumnId; maxValue: number }) {
  const defaultRange = useMemo<NumberRange>(() => {
    const [defaultMin, defaultMax] = parseRangeFilter(defaultFilters.find((f) => f.id === id)?.value) ?? []
    return [defaultMin ?? 0, defaultMax ?? maxValue]
  }, [defaultFilters, id, maxValue])

  return useUniqueDebounce({
    // Separate default and applied range, because the input's onBlur event that didn’t actually change anything could trigger the callback, and would clear the filter.
    defaultValue: useMemo((): NumberRange => {
      const [minFilter, maxFilter] = parseRangeFilter(columnFiltersById[id]) ?? []
      const [defaultMin, defaultMax] = defaultRange
      return [minFilter ?? defaultMin, maxFilter ?? defaultMax]
    }, [columnFiltersById, id, defaultRange]),
    callback: useCallback(
      (newRange: NumberRange) =>
        setColumnFilter(
          id,
          serializeRangeFilter(
            newRange.every((value, i) => value === defaultRange[i])
              ? null // remove the filter if the range is the same as the default range
              : [
                  newRange[0] === defaultRange[0] ? null : newRange[0],
                  newRange[1] === defaultRange[1] ? null : newRange[1],
                ],
          ),
        ),
      [defaultRange, id, setColumnFilter],
    ),
  })
}
