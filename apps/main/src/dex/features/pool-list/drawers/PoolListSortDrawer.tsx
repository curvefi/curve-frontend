import type { OnChangeFn, SortingState } from '@tanstack/react-table'
import { TableSortDrawer } from '@ui-kit/shared/ui/DataTable/TableSortDrawer'
import type { PoolListSortableColumn } from '../poolList.constants'

type Props = {
  onSortingChange: OnChangeFn<SortingState>
  options: readonly { id: PoolListSortableColumn; label: string }[]
  sortField: PoolListSortableColumn
}

export const PoolListSortDrawer = ({ onSortingChange, options, sortField }: Props) => (
  <TableSortDrawer
    buttonTestId="btn-drawer-sort-dex-pools"
    drawerTestId="drawer-sort-menu-dex-pools"
    onSortingChange={onSortingChange}
    options={options}
    sortField={sortField}
  />
)
