import { useCallback, useMemo } from 'react'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { ChainFilterChips } from '@ui-kit/shared/ui/DataTable/chips/ChainFilterChips'
import { type FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { parseListFilter, serializeListFilter } from '@ui-kit/shared/ui/DataTable/filters'
import { useMappedQuery, type QueryProp } from '@ui-kit/types/util'
import { getUniqueSortedStrings } from '@ui-kit/utils/sorting'
import { LlamaMarketColumnId } from '../columns'

export const LlamaChainFilterChips = ({
  marketsQuery,
  columnFiltersById,
  setColumnFilter,
}: {
  marketsQuery: QueryProp<LlamaMarket[]>
} & FilterProps<LlamaMarketColumnId>) => {
  const selectedChains = useMemo(
    () => parseListFilter(columnFiltersById[LlamaMarketColumnId.Chain]),
    [columnFiltersById],
  )

  const toggleChain = useCallback(
    (chain: string) =>
      setColumnFilter(
        LlamaMarketColumnId.Chain,
        serializeListFilter(
          selectedChains?.includes(chain)
            ? selectedChains.length === 1
              ? undefined
              : selectedChains.filter(c => c !== chain)
            : [...(selectedChains ?? []), chain],
        ),
      ),
    [selectedChains, setColumnFilter],
  )

  return (
    <ChainFilterChips
      chainsQuery={useMappedQuery(marketsQuery, data =>
        getUniqueSortedStrings(
          data.filter(market => !market.deprecatedMessage || market.userHasPositions),
          LlamaMarketColumnId.Chain,
        ),
      )}
      selectedChains={selectedChains}
      toggleChain={toggleChain}
    />
  )
}
