import { useCallback } from 'react'
import { LlamaMarketColumnId } from '@/llamalend/PageLlamaMarkets/columns.enum'
import { useLlamaMarketSortOptions } from '@/llamalend/PageLlamaMarkets/hooks/useLlamaMarketSortOptions'
import { OnChangeFn, SortingState } from '@tanstack/react-table'
import { type Option, SelectFilter } from '@ui-kit/shared/ui/DataTable/SelectFilter'

export const LlamaMarketSort = ({
  sortField,
  onSortingChange,
}: {
  onSortingChange: OnChangeFn<SortingState>
  sortField: LlamaMarketColumnId
}) => (
  <SelectFilter
    name="sort"
    options={useLlamaMarketSortOptions()}
    onSelected={useCallback(
      ({ id }: Option<LlamaMarketColumnId>) => onSortingChange([{ id, desc: true }]),
      [onSortingChange],
    )}
    value={sortField}
  />
)
