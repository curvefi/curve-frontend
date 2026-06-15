import { useCallback } from 'react'
import type { OnChangeFn, SortingState } from '@tanstack/react-table'
import { Option, SelectFilter } from '@ui-kit/shared/ui/DataTable/SelectFilter'
import type { LegacyPoolColumnId } from '../columns'

export const LegacyPoolListSort = ({
  sortField,
  onSortingChange,
}: {
  onSortingChange: OnChangeFn<SortingState>
  sortField: LegacyPoolColumnId
}) => (
  <SelectFilter
    name="sort"
    options={[]} // todo
    onSelected={useCallback(({ id }: Option<LegacyPoolColumnId>) => onSortingChange([{ id, desc: true }]), [onSortingChange])}
    value={sortField}
  />
)
