import { useCallback } from 'react'
import type { OnChangeFn, SortingState } from '@tanstack/react-table'
import { Option, SelectFilter } from '@ui-kit/shared/ui/DataTable/SelectFilter'
import type { PoolColumnId } from '../columns'

export const PoolListSort = ({
  sortField,
  onSortingChange,
}: {
  onSortingChange: OnChangeFn<SortingState>
  sortField: PoolColumnId
}) => (
  <SelectFilter
    name="sort"
    options={[]} // todo
    onSelected={useCallback(({ id }: Option<PoolColumnId>) => onSortingChange([{ id, desc: true }]), [onSortingChange])}
    value={sortField}
  />
)
