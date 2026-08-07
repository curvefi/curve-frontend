import { useCallback } from 'react'
import { resetLitePoolList, resetPoolList, useLitePoolList, usePoolList } from '@/dex/queries/pool-list.query'
import type { NetworkConfig } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import type {
  LitePool,
  SortDirection as PoolSortDirection,
  V2PoolSortField as PoolSortField,
} from '@curvefi/prices-api/pools'
import type { Address } from '@primitives/address.utils'
import { maybe } from '@primitives/objects.utils'
import { useCampaigns, type CampaignRewards } from '@ui-kit/entities/campaigns'
import { DEX_ROUTES } from '@ui-kit/shared/routes'
import { useMappedQuery } from '@ui-kit/types/util'
import { apyToApr, AVERAGE_CATEGORIES } from '@ui-kit/utils'
import { isVyperVulnerablePool } from '../alerts'
import type { PoolsApiParams } from '../filters/utils'
import type { PoolRow } from '../types'
import { POOLS_PAGE_SIZE } from './usePoolsPagination'
import { usePoolsUserHasPosition } from './usePoolsUserHasPosition'

type PoolsCampaignsByAddress = Record<string, CampaignRewards[]>
type PoolListData = Omit<PoolRow, 'campaigns' | 'hasPosition' | 'hasVyperVulnerability' | 'network' | 'url'>

const POOL_COMPOUND_WINDOW = AVERAGE_CATEGORIES['dex.poolYield.compoundRate'].window

// TODO: Temporary API2 APY-to-APR compatibility adapter for the beta pool list.
// Remove when PoolRow and yield cells consume APY directly before beta graduation.
const apyToPoolApr = (apy: number | null | undefined) => apyToApr(apy, POOL_COMPOUND_WINDOW)

/** Maps API2's Lite pool shape into the source-independent pool-list model. */
const litePoolToPool = (pool: LitePool): PoolListData => {
  const gauges = [
    ...new Set([pool.gaugeAddress, pool.rootGaugeAddress].filter((address): address is Address => address != null)),
  ].map(address => ({ address, isKilled: pool.gaugeIsKilled ?? false }))

  return {
    address: pool.address,
    baseDailyApr: null,
    baseWeeklyApr: null,
    coins: (pool.coins ?? []).map((coin, poolIndex) => ({
      address: coin.address,
      decimals: Number(coin.decimals),
      poolIndex,
      symbol: coin.symbol ?? '',
    })),
    creationDate: null,
    crvApr: apyToPoolApr(pool.gaugeCrvApy?.[0]),
    crvAprBoosted: apyToPoolApr(pool.gaugeCrvApy?.[1]),
    extraRewardsApr: (pool.gaugeExtraRewards ?? []).flatMap(
      reward =>
        maybe(apyToPoolApr(reward.apy), apr => [
          {
            address: reward.tokenAddress,
            apr,
            decimals: Number(reward.decimals),
            name: reward.name,
            price: reward.tokenPrice,
            symbol: reward.symbol,
          },
        ]) ?? [],
    ),
    gauge: gauges[0] ?? null,
    gauges,
    isMetapool: pool.isMetaPool,
    name: pool.name ?? '',
    poolType: null,
    tvlUsd: pool.tvl,
  }
}

const apiPoolToRow = (
  network: NetworkConfig,
  pool: PoolListData,
  hasPosition: PoolRow['hasPosition'],
  campaignsByAddress?: PoolsCampaignsByAddress,
): PoolRow => ({
  ...pool,
  campaigns: campaignsByAddress?.[pool.address.toLocaleLowerCase()] ?? [],
  hasPosition,
  hasVyperVulnerability: isVyperVulnerablePool(network.chainId, pool.address),
  network: network.id,
  url: getPath({ network: network.id }, `${DEX_ROUTES.PAGE_POOLS}/${pool.address}/deposit`),
})

/** Fetches the selected pool-list source and maps its API rows into table rows. */
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
  const { data: campaignsByAddress } = useCampaigns({ blockchainId: network.networkId })

  const litePoolListParams = { chainId: network.chainId }
  const litePoolListQuery = useLitePoolList(litePoolListParams, network.isLite)
  const liteTableQuery = useMappedQuery(
    litePoolListQuery,
    useCallback(
      ({ pools }) =>
        pools.map(pool =>
          apiPoolToRow(network, litePoolToPool(pool), hasUserPoolPosition(pool.address), campaignsByAddress),
        ),
      [campaignsByAddress, hasUserPoolPosition, network],
    ),
  )

  const poolListParams = {
    chainId: network.chainId,
    page,
    pageSize: POOLS_PAGE_SIZE,
    searchString: searchText || undefined,
    ...filters,
    sortBy,
    sortDirection,
  }
  const poolListQuery = usePoolList(poolListParams, !network.isLite)
  const fullTableQuery = useMappedQuery(
    poolListQuery,
    useCallback(
      ({ pools }) =>
        pools.map(pool => apiPoolToRow(network, pool, hasUserPoolPosition(pool.address), campaignsByAddress)),
      [campaignsByAddress, hasUserPoolPosition, network],
    ),
  )

  const tableQuery = network.isLite ? liteTableQuery : fullTableQuery

  return {
    isFetching: network.isLite ? litePoolListQuery.isFetching : poolListQuery.isFetching,
    onReload: () => (network.isLite ? resetLitePoolList(litePoolListParams) : resetPoolList(poolListParams)),
    pageCount: network.isLite ? 1 : (poolListQuery.data?.pageCount ?? -1),
    userHasPositions: tableQuery.data?.some(({ hasPosition }) => hasPosition),
    tableQuery,
  }
}
