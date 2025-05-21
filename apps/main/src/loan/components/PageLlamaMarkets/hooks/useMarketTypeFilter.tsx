import { useCallback } from 'react'
import { LlamaMarketColumnId } from '@/loan/components/PageLlamaMarkets/columns.enum'
import { type LlamaMarketKey, LlamaMarketType } from '@/loan/entities/llama-markets'
import type { FilterProps } from '@ui-kit/shared/ui/DataTable'

/**
 * Hook for managing market type filter (Mint/Lend) in the Llama Markets table.
 * @returns marketTypes - object with keys for each market type and boolean values indicating if the type is selected
 * @returns toggles - object with keys for each market type and functions to toggle the type
 */
export function useMarketTypeFilter({ columnFiltersById, setColumnFilter }: FilterProps<LlamaMarketKey>) {
  const filter = columnFiltersById[LlamaMarketColumnId.Type] as LlamaMarketType[] | undefined

  /** Helper function to toggle the market type filter by updating the column filter state */
  const toggleMarketType = useCallback(
    (type: LlamaMarketType) => {
      setColumnFilter(
        LlamaMarketColumnId.Type,
        filter?.includes(type) ? filter.filter((f) => f !== type) : [...(filter || []), type],
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
