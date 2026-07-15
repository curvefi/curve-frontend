import { useCallback } from 'react'
import { resetPoolList, usePoolList } from '@/dex/queries/pool-list.query'
import type { NetworkConfig } from '@/dex/types/main.types'
import type { Chain } from '@curvefi/prices-api'
import type { SortDirection as PoolSortDirection, V2PoolSortField as PoolSortField } from '@curvefi/prices-api/pools'
import { useCampaigns } from '@ui-kit/entities/campaigns'
import { useMappedQuery } from '@ui-kit/types/util'
import type { PoolsApiParams } from '../pools.filter'
import { getPoolListItem } from '../pools.utils'
import { POOLS_PAGE_SIZE } from './usePoolsPagination'
import { usePoolsUserHasPosition } from './usePoolsUserHasPosition'

type PoolsTableParams = {
  filters: PoolsApiParams
  network: NetworkConfig
  page: number
  searchText: string
  sortBy: PoolSortField
  sortDirection: PoolSortDirection
}

/** Fetches the current pool page and maps API rows into table rows. */
export const usePoolsTable = ({ filters, network, page, searchText, sortBy, sortDirection }: PoolsTableParams) => {
  const hasUserPoolPosition = usePoolsUserHasPosition(network.chainId)
  const { data: campaignsByAddress } = useCampaigns({ blockchainId: network.networkId as Chain })
  const poolListParams = {
    chainId: network.chainId,
    page,
    pageSize: POOLS_PAGE_SIZE,
    searchString: searchText || undefined,
    ...filters,
    sortBy,
    sortDirection,
  }
  const poolListQuery = usePoolList(poolListParams)
  const { data: poolList, isFetching } = poolListQuery

  const tableQuery = useMappedQuery(
    poolListQuery,
    useCallback(
      ({ pools }) =>
        pools.map(pool => getPoolListItem(network, pool, hasUserPoolPosition(pool.address), campaignsByAddress)),
      [campaignsByAddress, hasUserPoolPosition, network],
    ),
  )

  return {
    isFetching,
    onReload: () => resetPoolList(poolListParams),
    pageCount: poolList?.pageCount ?? -1,
    userHasPositions: tableQuery.data?.some(({ hasPosition }) => hasPosition),
    tableQuery,
  }
}
