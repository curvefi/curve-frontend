import { useCallback, useMemo } from 'react'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { ChainFilterChips } from '@evm-ui/shared/ui/DataTable/chips/ChainFilterChips'
import { getUniqueSortedStrings } from '@evm-ui/utils/sorting'
import { useMappedQuery, type QueryProp } from '@ui/features/queries/util'
import { type FilterProps } from '@ui/features/tables/data-table.utils'
import { parseListFilter, serializeListFilter } from '@ui/features/tables/filters'
import { MarketColumnId } from '../columns/columns.enum'

const getChains = (data: LlamaMarket[]) =>
  getUniqueSortedStrings(
    data.filter(market => !market.deprecatedMessage || market.userHasPositions),
    'blockchainId',
  )

export const MarketsChainFilterChips = ({
  marketsQuery,
  columnFiltersById,
  setColumnFilter,
}: { marketsQuery: QueryProp<LlamaMarket[]> } & FilterProps<MarketColumnId>) => {
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
