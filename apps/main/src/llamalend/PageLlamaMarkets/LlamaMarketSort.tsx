import { useCallback } from 'react'
import { OnChangeFn, SortingState } from '@tanstack/react-table'
import { type Option, SelectFilter } from '@ui-kit/shared/ui/DataTable/SelectFilter'
import { LlamaMarketColumnId } from './columns.enum'
import { useLlamaMarketSortOptions } from './hooks/useLlamaMarketSortOptions'

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
