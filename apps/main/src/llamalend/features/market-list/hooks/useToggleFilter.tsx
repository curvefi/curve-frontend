import { useCallback } from 'react'
import type { LlamaMarketKey } from '@/llamalend/entities/llama-markets'
import type { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'

/** Hook for managing a single boolean filter */
export function useToggleFilter(key: LlamaMarketKey, filterProps: FilterProps<LlamaMarketKey>) {
  const { columnFiltersById, setColumnFilter } = filterProps || {}
  const isSelected = !!columnFiltersById?.[key]
  const toggle = useCallback(
    () => setColumnFilter?.(key, isSelected ? undefined : true),
    [isSelected, key, setColumnFilter],
  )
  return [isSelected, toggle] as const
}
