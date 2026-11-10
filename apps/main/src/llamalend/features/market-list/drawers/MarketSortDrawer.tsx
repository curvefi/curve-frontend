import { OnChangeFn, SortingState } from '@tanstack/react-table'
import { TableSortDrawer } from '@ui/features/tables/TableSortDrawer'
import { getSortableColumnIds } from '@ui/hooks/useSortFromQueryString'
import type { MarketColumnId } from '../columns/columns.enum'
import type { MarketTable } from '../columns/shared.columns'

type Props = {
  testId: string
  columns: MarketTable['columns']
  onSortingChange: OnChangeFn<SortingState>
  sortField: MarketColumnId
}

export const MarketSortDrawer = ({ testId, columns, onSortingChange, sortField }: Props) => (
  <TableSortDrawer
    buttonTestId={`btn-drawer-sort-${testId}`}
    drawerTestId={`drawer-sort-menu-${testId}`}
    onSortingChange={onSortingChange}
    options={columns
      .filter(({ id }) => getSortableColumnIds(columns).has(id))
      .map(({ id, header }) => ({ id: id as MarketColumnId, label: String(header) }))}
    sortField={sortField}
  />
)
