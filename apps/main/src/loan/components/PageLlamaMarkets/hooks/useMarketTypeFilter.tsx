import { useCallback } from 'react'
import { LlamaMarketColumnId } from '@/loan/components/PageLlamaMarkets/columns.enum'
import { type LlamaMarketKey, LlamaMarketType } from '@/loan/entities/llama-markets'
import type { FilterProps } from '@ui-kit/shared/ui/DataTable'

/**
 * Hook for managing market type filter
 * @returns marketTypes - object with keys for each market type and boolean values indicating if the type is selected
 * @returns toggles - object with keys for each market type and functions to toggle the type
 */
export function useMarketTypeFilter({ columnFiltersById, setColumnFilter }: FilterProps<LlamaMarketKey>) {
  const filter = columnFiltersById[LlamaMarketColumnId.Type] as LlamaMarketType[] | undefined
  const toggleMarketType = useCallback(
    (type: LlamaMarketType) => {
      setColumnFilter(
        LlamaMarketColumnId.Type,
        filter?.includes(type) ? filter.filter((f) => f !== type) : [...(filter || []), type],
      )
    },
    [filter, setColumnFilter],
  )

  const marketTypes = {
    [LlamaMarketType.Mint]: filter?.includes(LlamaMarketType.Mint) ?? false,
    [LlamaMarketType.Lend]: filter?.includes(LlamaMarketType.Lend) ?? false,
  }
  const toggles = {
    [LlamaMarketType.Mint]: useCallback(() => toggleMarketType(LlamaMarketType.Mint), [toggleMarketType]),
    [LlamaMarketType.Lend]: useCallback(() => toggleMarketType(LlamaMarketType.Lend), [toggleMarketType]),
  }
  return [marketTypes, toggles] as const
}
