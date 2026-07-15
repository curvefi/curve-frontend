import { useCallback } from 'react'
import type { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import type { MarketColumnId } from '../columns'

/** Hook for managing a single boolean filter */
export function useToggleFilter(
  key: MarketColumnId,
  { columnFiltersById, setColumnFilter }: FilterProps<MarketColumnId> & { defaultValue?: true },
) {
  const isSelected = ![null, undefined, '', 'no'].includes(columnFiltersById[key])
  const toggle = useCallback(() => setColumnFilter(key, isSelected ? null : 'yes'), [isSelected, key, setColumnFilter])
  return [isSelected, toggle] as const
}
