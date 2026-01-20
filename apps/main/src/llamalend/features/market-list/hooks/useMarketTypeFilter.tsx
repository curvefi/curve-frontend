import { useCallback, useMemo } from 'react'
import { type FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { parseListFilter, serializeListFilter } from '@ui-kit/shared/ui/DataTable/filters'
import { LlamaMarketType } from '@ui-kit/types/market'
import { LlamaMarketColumnId } from '../columns'

/**
 * Hook for managing market type filter (Mint/Lend) in the Llama Markets table.
 * @returns marketTypes - object with keys for each market type and boolean values indicating if the type is selected
 * @returns toggles - object with keys for each market type and functions to toggle the type
 */
export function useMarketTypeFilter({ columnFiltersById, setColumnFilter }: FilterProps<LlamaMarketColumnId>) {
  const rawFilter = columnFiltersById[LlamaMarketColumnId.Type]
  const filter = useMemo(() => parseListFilter(rawFilter), [rawFilter])

  /** Helper function to toggle the market type filter by updating the column filter state */
  const toggleMarketType = useCallback(
    (type: LlamaMarketType) => {
      setColumnFilter(
        LlamaMarketColumnId.Type,
        serializeListFilter(filter?.includes(type) ? filter.filter((f) => f !== type) : [...(filter ?? []), type]),
      )
    },
    [filter, setColumnFilter],
  )

  /** Defines which market types are selected based on the current filter state. */
  const marketTypes = {
    [LlamaMarketType.Mint]: filter?.includes(LlamaMarketType.Mint) ?? false,
    [LlamaMarketType.Lend]: filter?.includes(LlamaMarketType.Lend) ?? false,
  }

  /** Defines toggle functions for each market type, which can be used in the UI to change the filter state. */
  const toggles = {
    [LlamaMarketType.Mint]: useCallback(() => toggleMarketType(LlamaMarketType.Mint), [toggleMarketType]),
    [LlamaMarketType.Lend]: useCallback(() => toggleMarketType(LlamaMarketType.Lend), [toggleMarketType]),
  }
  return [marketTypes, toggles] as const
}
