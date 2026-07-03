import { useMemo } from 'react'
import type { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { useFilters } from '@ui-kit/shared/ui/DataTable/hooks/useFilters'
import { POOL_LIST_POOL_TYPE_FILTERS } from '../poolList.constants'
import {
  getPoolListApiParams,
  hasPoolListActiveFilters,
  POOL_LIST_FILTER_CHANGE_UPDATE,
  PoolListFilterId,
  POOL_LIST_SEARCH_QUERY_FIELD,
} from '../poolListFilterQuery'

export { POOL_LIST_DEFAULT_TVL_MIN } from '../poolListFilterQuery'
export { PoolListFilterId }
export type { PoolListApiParams } from '../poolListFilterQuery'

export type PoolListFilterProps = FilterProps<PoolListFilterId> & {
  poolTypeFilters: typeof POOL_LIST_POOL_TYPE_FILTERS
}

/**
 * Pool list filters share the DataTable URL filter contract, then map those
 * serialized values into prices API params because filtering happens server-side.
 */
export const usePoolListFilters = () => {
  const { globalFilter, setGlobalFilter, columnFiltersById, setColumnFilter, resetFilters } = useFilters({
    columns: PoolListFilterId,
    extraParamsOnFilterChange: POOL_LIST_FILTER_CHANGE_UPDATE,
    searchKey: POOL_LIST_SEARCH_QUERY_FIELD,
  })

  const filterProps: PoolListFilterProps = useMemo(
    () => ({
      columnFiltersById,
      poolTypeFilters: POOL_LIST_POOL_TYPE_FILTERS,
      setColumnFilter,
    }),
    [columnFiltersById, setColumnFilter],
  )

  return {
    apiParams: getPoolListApiParams(columnFiltersById),
    filterProps,
    hasActiveFilters: hasPoolListActiveFilters(columnFiltersById),
    onSearch: setGlobalFilter,
    resetFilters,
    searchText: globalFilter,
  }
}
