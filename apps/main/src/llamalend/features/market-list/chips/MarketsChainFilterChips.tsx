import { useCallback, useMemo } from 'react'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { ChainFilterChips } from '@ui-kit/shared/ui/DataTable/chips/ChainFilterChips'
import { type FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { parseListFilter, serializeListFilter } from '@ui-kit/shared/ui/DataTable/filters'
import { useMappedQuery, type QueryProp } from '@ui-kit/types/util'
import { getUniqueSortedStrings } from '@ui-kit/utils/sorting'
import { MarketColumnId } from '../columns'

const getChains = (data: LlamaMarket[]) =>
  getUniqueSortedStrings(
    data.filter(market => !market.deprecatedMessage || market.userHasPositions),
    MarketColumnId.Chain,
  )

export const MarketsChainFilterChips = ({
  marketsQuery,
  columnFiltersById,
  setColumnFilter,
}: {
  marketsQuery: QueryProp<LlamaMarket[]>
} & FilterProps<MarketColumnId>) => {
  const selectedChains = useMemo(() => parseListFilter(columnFiltersById[MarketColumnId.Chain]), [columnFiltersById])

  const toggleChain = useCallback(
    (chain: string) =>
      setColumnFilter(
        MarketColumnId.Chain,
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
      chainsQuery={useMappedQuery(marketsQuery, getChains)}
      selectedChains={selectedChains}
      toggleChain={toggleChain}
    />
  )
}
