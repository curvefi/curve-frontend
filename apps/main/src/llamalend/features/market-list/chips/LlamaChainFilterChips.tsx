import { useCallback, useMemo } from 'react'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { ChainFilterChips } from '@ui-kit/shared/ui/DataTable/chips/ChainFilterChips'
import { type FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { parseListFilter, serializeListFilter } from '@ui-kit/shared/ui/DataTable/filters'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { QueryProp } from '@ui-kit/types/util'
import { getUniqueSortedStrings } from '@ui-kit/utils/sorting'
import { LlamaMarketColumnId } from '../columns'

const { IconSize } = SizesAndSpaces

export const LlamaChainFilterChips = ({
  markets,
  columnFiltersById,
  setColumnFilter,
}: {
  markets: QueryProp<LlamaMarket[]>
} & FilterProps<LlamaMarketColumnId>) => {
  const chains = useMemo(
    () =>
      getUniqueSortedStrings(
        (markets.data ?? []).filter(market => !market.deprecatedMessage || market.userHasPositions),
        LlamaMarketColumnId.Chain,
      ),
    [markets.data],
  )
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
    <WithSkeleton loading={markets.isLoading} width={'100%'} height={IconSize.md.desktop} variant="rectangular">
      <ChainFilterChips chains={chains} selectedChains={selectedChains} toggleChain={toggleChain} />
    </WithSkeleton>
  )
}
