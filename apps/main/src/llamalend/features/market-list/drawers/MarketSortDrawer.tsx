import { OnChangeFn, SortingState } from '@tanstack/react-table'
import { TableSortDrawer } from '@ui-kit/shared/ui/DataTable/TableSortDrawer'
import { LlamaMarketColumnId } from '../columns'
import { useLlamaMarketSortOptions } from '../hooks/useLlamaMarketSortOptions'

type Props = {
  onSortingChange: OnChangeFn<SortingState>
  sortField: LlamaMarketColumnId
}

export const MarketSortDrawer = ({ onSortingChange, sortField }: Props) => {
  const sortOptions = useLlamaMarketSortOptions()

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
