import { useCallback, useMemo } from 'react'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { ChainFilterChips } from '@ui-kit/shared/ui/DataTable/chips/ChainFilterChips'
import { type FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { parseListFilter, serializeListFilter } from '@ui-kit/shared/ui/DataTable/filters'
import { getUniqueSortedStrings } from '@ui-kit/utils/sorting'
import { LlamaMarketColumnId } from '../columns'

export const LlamaChainFilterChips = ({
  data,
  columnFiltersById,
  setColumnFilter,
}: {
  data: LlamaMarket[]
} & FilterProps<LlamaMarketColumnId>) => {
  const chains = useMemo(() => getUniqueSortedStrings(data, LlamaMarketColumnId.Chain), [data])
  const selectedChains = parseListFilter(columnFiltersById[LlamaMarketColumnId.Chain])

  const toggleChain = useCallback(
    (chain: string) =>
      setColumnFilter(
        LlamaMarketColumnId.Chain,
        serializeListFilter(
          selectedChains?.includes(chain)
            ? selectedChains.length === 1
              ? undefined
              : selectedChains.filter((c) => c !== chain)
            : [...(selectedChains ?? []), chain],
        ),
      ),
    [selectedChains, setColumnFilter],
  )

  return <ChainFilterChips chains={chains} selectedChains={selectedChains} toggleChain={toggleChain} />
}
