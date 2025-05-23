import { useCallback } from 'react'
import type { LlamaMarketKey } from '@/loan/entities/llama-markets'
import type { FilterProps } from '@ui-kit/shared/ui/DataTable'

/** Hook for managing a single boolean filter */
export function useToggleFilter(
  key: LlamaMarketKey,
  { columnFiltersById, setColumnFilter }: FilterProps<LlamaMarketKey>,
) {
  const isSelected = !!columnFiltersById[key]
  const toggle = useCallback(
    () => setColumnFilter(key, isSelected ? undefined : true),
    [isSelected, key, setColumnFilter],
  )
  return [isSelected, toggle] as const
}
