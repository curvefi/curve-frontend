import { useMemo } from 'react'
import type { PartialRecord } from '@primitives/objects.utils'
import type { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { useFilters } from '@ui-kit/shared/ui/DataTable/hooks/useFilters'
import {
  PoolFilterId,
  POOL_TYPE_FILTERS,
  parsePoolsRangeFilter,
  type PoolsApiParams,
  POOL_DEFAULT_TVL_MIN,
} from '../filters/utils'

export { POOL_DEFAULT_TVL_MIN } from '../filters/utils'
export { PoolFilterId }
export type { PoolsApiParams } from '../filters/utils'

const POOL_LIST_SEARCH_QUERY_FIELD = 'search'

export type PoolsFiltersProps = FilterProps<PoolFilterId> & {
  poolTypeFilters: typeof POOL_TYPE_FILTERS
}

type PoolsColumnFilters = PartialRecord<PoolFilterId, string>

export const getPoolsApiParams = (columnFiltersById: PoolsColumnFilters): PoolsApiParams => {
  const [minApy, maxApy] = parsePoolsRangeFilter(columnFiltersById[PoolFilterId.Apy])
  const [minTvl, maxTvl] = parsePoolsRangeFilter(columnFiltersById[PoolFilterId.Tvl])
  const [minVolume, maxVolume] = parsePoolsRangeFilter(columnFiltersById[PoolFilterId.Volume])

  return {
    maxApy: maxApy ?? undefined,
    maxTvl: maxTvl ?? undefined,
    maxVolume: maxVolume ?? undefined,
    minApy: minApy ?? undefined,
    minTvl: minTvl ?? POOL_DEFAULT_TVL_MIN,
    minVolume: minVolume ?? undefined,
    poolType: columnFiltersById[PoolFilterId.PoolType] || undefined,
  }
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
