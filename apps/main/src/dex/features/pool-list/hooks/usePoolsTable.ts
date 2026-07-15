import { useCallback } from 'react'
import { resetPoolList, usePoolList } from '@/dex/queries/pool-list.query'
import type { NetworkConfig } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import type { Chain } from '@curvefi/prices-api'
import type {
  SortDirection as PoolSortDirection,
  V2PoolSortField as PoolSortField,
  V2Pool,
} from '@curvefi/prices-api/pools'
import { useCampaigns, type CampaignRewards } from '@ui-kit/entities/campaigns'
import { DEX_ROUTES } from '@ui-kit/shared/routes'
import { useMappedQuery } from '@ui-kit/types/util'
import { isVyperVulnerablePool } from '../alerts'
import type { PoolsApiParams } from '../filters/utils'
import type { PoolRow } from '../types'
import { POOLS_PAGE_SIZE } from './usePoolsPagination'
import { usePoolsUserHasPosition } from './usePoolsUserHasPosition'

type PoolsCampaignsByAddress = Record<string, CampaignRewards[]>

const getPoolsCampaigns = (campaignsByAddress: PoolsCampaignsByAddress | undefined, poolAddress: string) =>
  campaignsByAddress?.[poolAddress.toLocaleLowerCase()] ?? []

const getPoolListItem = (
  network: NetworkConfig,
  pool: V2Pool,
  hasPosition: PoolRow['hasPosition'],
  campaignsByAddress?: PoolsCampaignsByAddress,
): PoolRow => ({
  ...pool,
  campaigns: getPoolsCampaigns(campaignsByAddress, pool.address),
  hasPosition,
  hasVyperVulnerability: isVyperVulnerablePool(network.chainId, pool.address),
  network: network.id,
  url: getPath({ network: network.id }, `${DEX_ROUTES.PAGE_POOLS}/${pool.address}/deposit`),
})

/** Fetches the current pool page and maps API rows into table rows. */
export const usePoolsTable = ({
  filters,
  network,
  page,
  searchText,
  sortBy,
  sortDirection,
}: {
  filters: PoolsApiParams
  network: NetworkConfig
  page: number
  searchText: string
  sortBy: PoolSortField
  sortDirection: PoolSortDirection
}) => {
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
