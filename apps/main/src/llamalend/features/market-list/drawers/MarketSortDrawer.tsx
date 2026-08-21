import { TableSortDrawer } from '@evm-ui/shared/ui/DataTable/TableSortDrawer'
import { OnChangeFn, SortingState } from '@tanstack/react-table'
import { MarketColumnId } from '../columns'
import { useMarketsSortOptions } from '../hooks/useMarketsSortOptions'

type Props = {
  onSortingChange: OnChangeFn<SortingState>
  sortField: MarketColumnId
}

export const MarketSortDrawer = ({ onSortingChange, sortField }: Props) => {
  const sortOptions = useMarketsSortOptions()

  return (
    <TableSortDrawer
      buttonTestId="btn-drawer-sort-lamalend-markets"
      drawerTestId="drawer-sort-menu-lamalend-markets"
      onSortingChange={onSortingChange}
      options={sortOptions}
      sortField={sortField}
    />
  )
}
