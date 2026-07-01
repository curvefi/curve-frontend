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
  isLoading = false,
  columnFiltersById,
  setColumnFilter,
  id,
  min = 0,
  max,
}: FilterProps<TColumnId> & { id: TColumnId; min?: number; max: number | undefined; isLoading?: boolean }) =>
  useUniqueDebounce({
    // Separate default and applied range, the input's onBlur event that didn't change anything could trigger the callback and clear the filter.
    defaultValue: useMemo((): Range<number | null> => {
      const [minFilter, maxFilter] = parseRangeFilter(columnFiltersById[id]) ?? []
      return [minFilter ?? (isLoading ? null : min), maxFilter ?? (isLoading || max == null ? null : max)]
    }, [columnFiltersById, id, isLoading, min, max]),
    callback: useCallback(
      (newRange: Range<number | null>) =>
        setColumnFilter(id, serializeRangeFilter(normalizeRangeFilterDefaults(newRange, [min, max]))),
      [id, min, max, setColumnFilter],
    ),
  })
