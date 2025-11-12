import { useCallback } from 'react'
import type { LlamaMarketColumnId } from '@/llamalend/features/market-list/columns.enum'
import type { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'

/** Hook for managing a single boolean filter */
export function useToggleFilter(
  key: LlamaMarketColumnId,
  { columnFiltersById, setColumnFilter }: FilterProps<LlamaMarketColumnId> & { defaultValue?: true },
) {
  const isSelected = ![null, undefined, '', 'no'].includes(columnFiltersById[key])
  const toggle = useCallback(() => setColumnFilter(key, isSelected ? null : 'yes'), [isSelected, key, setColumnFilter])
  return [isSelected, toggle] as const
}
