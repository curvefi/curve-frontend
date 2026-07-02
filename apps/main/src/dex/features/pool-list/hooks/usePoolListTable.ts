import { useCallback } from 'react'
import { usePoolList } from '@/dex/queries/pool-list.query'
import type { NetworkConfig } from '@/dex/types/main.types'
import type { SortDirection as PoolSortDirection, V2PoolSortField as PoolSortField } from '@curvefi/prices-api/pools'
import { useMappedQuery } from '@ui-kit/types/util'
import { getPoolListItem } from '../poolList.utils'
import type { PoolListApiParams } from './usePoolListFilters'
import { POOL_LIST_PAGE_SIZE } from './usePoolListPagination'
import { usePoolListUserHasPosition } from './usePoolListUserHasPosition'

type PoolListTableParams = {
  filters: PoolListApiParams
  network: NetworkConfig
  page: number
  searchText: string
  sortBy: PoolSortField
  sortDirection: PoolSortDirection
}

/** Fetches the current pool page and maps API rows into table rows. */
export const usePoolListTable = ({
  filters,
  network,
  page,
  searchText,
  sortBy,
  sortDirection,
}: PoolListTableParams) => {
  const hasUserPoolPosition = usePoolListUserHasPosition(network.chainId)
  const poolListQuery = usePoolList({
    chainId: network.chainId,
    page,
    pageSize: POOL_LIST_PAGE_SIZE,
    searchString: searchText || undefined,
    ...filters,
    sortBy,
    sortDirection,
  })
  const { data: poolList } = poolListQuery
  const tableQuery = useMappedQuery(
    poolListQuery,
    useCallback(
      ({ pools }) => pools.map(pool => getPoolListItem(network, pool, hasUserPoolPosition(pool.address))),
      [hasUserPoolPosition, network],
    ),
  )

  return {
    pageCount: poolList?.pageCount ?? -1,
    userHasPositions: tableQuery.data?.some(({ hasPosition }) => hasPosition),
    tableQuery,
  }
}
