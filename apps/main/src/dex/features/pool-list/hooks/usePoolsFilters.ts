import { useMemo } from 'react'
import type { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { useFilters } from '@ui-kit/shared/ui/DataTable/hooks/useFilters'
import { POOL_TYPE_FILTERS } from '../pools.constants'
import { getPoolsApiParams, PoolFilterId, POOL_LIST_SEARCH_QUERY_FIELD } from '../pools.filter'

export { POOL_DEFAULT_TVL_MIN } from '../pools.filter'
export { PoolFilterId }
export type { PoolsApiParams } from '../pools.filter'

export type PoolsFiltersProps = FilterProps<PoolFilterId> & {
  poolTypeFilters: typeof POOL_TYPE_FILTERS
}

/**
 * Pool list filters share the DataTable URL filter contract, then map those
 * serialized values into prices API params because filtering happens server-side.
 */
export const usePoolsFilters = () => {
  const { globalFilter, setGlobalFilter, columnFilters, columnFiltersById, setColumnFilter, resetFilters } = useFilters(
    {
      columns: PoolFilterId,
      resetPageOnChange: true,
      searchKey: POOL_LIST_SEARCH_QUERY_FIELD,
    },
  )

  const filterProps: PoolsFiltersProps = useMemo(
    () => ({
      columnFiltersById,
      poolTypeFilters: POOL_TYPE_FILTERS,
      setColumnFilter,
    }),
    [columnFiltersById, setColumnFilter],
  )

  return {
    apiParams: getPoolsApiParams(columnFiltersById),
    filterProps,
    onSearch: setGlobalFilter,
    resetFilters,
    searchText: globalFilter,
    columnFilters,
    globalFilter,
  }
}
