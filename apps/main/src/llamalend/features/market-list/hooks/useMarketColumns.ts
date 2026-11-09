import { useLlamalendPositionPnl } from '@evm-ui/hooks/useFeatureFlags'
import { fromEntries } from '@primitives/objects.utils'
import { useTableColumnOverrides } from '@ui/features/storage/useLocalStorage'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { useSortFromQueryString } from '@ui/hooks/useSortFromQueryString'
import { MarketColumnId } from '../columns/columns.enum'
import { getColumnSettings, getColumnVisibility } from '../columns/market-table'
import type { MarketTable } from '../columns/shared.columns'

const POSITION_PNL_COLUMNS: string[] = [MarketColumnId.UserEquity, MarketColumnId.UserPnl]

/**
 * The columns of a market table with their sorting and visibility.
 * The visibility on mobile is based on the sort field.
 * On larger devices, it follows the column list and the overrides of the user.
 */
export const useMarketColumns = ({
  columns: tableColumns,
  defaultSort,
  sortQueryField,
  storageKey,
  migration,
}: MarketTable) => {
  const columns = useLlamalendPositionPnl()
    ? tableColumns
    : tableColumns.filter(({ id }) => !POSITION_PNL_COLUMNS.includes(id))
  const [sorting, onSortingChange] = useSortFromQueryString(defaultSort, { fieldName: sortQueryField, columns })
  const sortField = sorting[0].id
  const [overrides, setOverrides] = useTableColumnOverrides(storageKey, migration)

  return {
    columns,
    sorting,
    onSortingChange,
    sortField: sortField as MarketColumnId,
    columnVisibility: useIsMobile()
      ? // on mobile that is just the column that cannot be hidden and the column that is currently sorted
        fromEntries(columns.map(({ id, enableHiding }) => [id, enableHiding === false || id === sortField]))
      : getColumnVisibility(columns, overrides),
    columnSettings: getColumnSettings(columns, overrides),
    toggleVisibility: ([id]: string[]) =>
      setOverrides(prev => ({ ...prev, [id]: !getColumnVisibility(columns, prev)[id] })),
  }
}
