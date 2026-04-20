import { useCallback, useMemo } from 'react'
import { useUniqueDebounce } from '@ui-kit/hooks/useDebounce'
import type { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { parseRangeFilter, serializeRangeFilter } from '@ui-kit/shared/ui/DataTable/filters'
import { Range } from '@ui-kit/types/util'

const defaultMin = 0

export function useRangeFilter<TColumnId extends string>({
  columnFiltersById,
  setColumnFilter,
  id,
  maxValue,
}: FilterProps<TColumnId> & { id: TColumnId; maxValue: number }) {
  return useUniqueDebounce({
    // Separate default and applied range, the input's onBlur event that didn’t change anything could trigger the callback and clear the filter
    defaultValue: useMemo((): Range<number> => {
      const [minFilter, maxFilter] = parseRangeFilter(columnFiltersById[id]) ?? []
      return [minFilter ?? defaultMin, maxFilter ?? maxValue]
    }, [columnFiltersById, id, maxValue]),
    callback: useCallback(
      (newRange: Range<number>) =>
        setColumnFilter(
          id,
          serializeRangeFilter(
            newRange.map((value, i) => (value === [defaultMin, maxValue][i] ? null : value)) as Range<number | null>,
          ),
        ),
      [id, maxValue, setColumnFilter],
    ),
  })
}
