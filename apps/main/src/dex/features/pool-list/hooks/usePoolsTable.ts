import { useCallback } from 'react'
import { isAddressEqual } from 'viem'
import { useConnection } from 'wagmi'
import {
  resetLitePoolChains,
  resetLitePoolList,
  resetPoolChains,
  resetPoolList,
  useLitePoolChains,
  useLitePoolList,
  usePoolChains,
  usePoolList,
} from '@/dex/queries/pool-list.query'
import { resetUserPoolPositions, useUserPoolPositions } from '@/dex/queries/user-pool-positions.query'
import type { NetworkConfig } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import type {
  LitePool,
  SortDirection as PoolSortDirection,
  V2Pool,
  V2PoolSortField as PoolSortField,
} from '@curvefi/prices-api/pools'
import { useCampaigns, type CampaignRewards } from '@evm-ui/entities/campaigns'
import { isLiteChain } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import { DEX_ROUTES } from '@evm-ui/shared/routes'
import { notFalsy } from '@primitives/objects.utils'
import { q, useMappedQuery } from '@ui/features/queries/util'
import { isVyperVulnerablePool } from '../alerts'
import type { PoolsApiParams } from '../filters/utils'
import type { PoolRow, PoolRowData } from '../types'
import { POOLS_PAGE_SIZE } from './usePoolsPagination'

class UnsupportedPoolListError extends Error {
  constructor(readonly chainId: number) {
    super(`The pool list is not supported on chain ${chainId}`)
    this.name = 'UnsupportedPoolListError'
  }
}

/** Maps Prices API pool data into the source-independent pool-list model. */
const poolToRowData = (pool: V2Pool): PoolRowData => ({
  address: pool.address,
  baseDailyApr: pool.baseDailyApr ?? undefined,
  baseWeeklyApr: pool.baseWeeklyApr ?? undefined,
  coins: pool.coins,
  creationDate: pool.creationDate ?? undefined,
  crvApr: pool.crvApr ?? undefined,
  crvAprBoosted: pool.crvAprBoosted ?? undefined,
  extraRewardsApr: pool.extraRewardsApr.map(({ address, apr, name, symbol }) => ({
    address: address ?? undefined,
    apr,
    name: name ?? undefined,
    symbol: symbol ?? undefined,
  })),
  gauge: pool.gauge ?? undefined,
  gauges: pool.gauges,
  isMetapool: pool.isMetapool ?? false,
  name: pool.name,
  poolType: pool.poolType ?? undefined,
  tradeableCoins: pool.tradeableCoins.map(({ address, symbol }) => ({ address, symbol })),
  tradingVolume24h: pool.tradingVolume24h,
  tvlUsd: pool.tvlUsd ?? undefined,
})

/** Maps API2's Lite pool shape into the source-independent pool-list model. */
const litePoolToRowData = (pool: LitePool): PoolRowData => {
  const gauges = [...new Set(notFalsy(pool.gaugeAddress, pool.rootGaugeAddress))].map(address => ({
    address,
    isKilled: pool.gaugeIsKilled ?? false,
  }))
  const coins = (pool.coins ?? []).map(coin => ({ address: coin.address, symbol: coin.symbol ?? '' }))

  return {
    address: pool.address,
    baseDailyApr: undefined,
    baseWeeklyApr: undefined,
    coins,
    creationDate: undefined,
    crvApr: pool.gaugeCrvApr?.[0],
    crvAprBoosted: pool.gaugeCrvApr?.[1],
    extraRewardsApr: (pool.gaugeExtraRewards ?? []).flatMap(reward =>
      notFalsy(
        reward.apr != null && {
          address: reward.tokenAddress,
          apr: reward.apr,
          decimals: Number(reward.decimals),
          name: reward.name,
          price: reward.tokenPrice,
          symbol: reward.symbol,
        },
      ),
    ),
    gauge: gauges[0],
    gauges,
    isMetapool: pool.isMetaPool,
    name: pool.name ?? '',
    poolType: undefined,
    tradeableCoins: coins,
    tradingVolume24h: undefined,
    tvlUsd: pool.tvl,
  }
}

/** Enriches a pool from the API into a fully fledged table row with all necessary data. */
const enrichPoolRow = (
  pool: PoolRowData,
  {
    chainId,
    blockchainId,
    hasPosition,
    campaignsByAddress,
  }: {
    chainId: number
    blockchainId: string
    hasPosition: PoolRow['hasPosition']
    campaignsByAddress?: Record<string, CampaignRewards[]>
  },
): PoolRow => ({
  ...pool,
  chainId,
  blockchainId,
  campaigns: campaignsByAddress?.[pool.address.toLocaleLowerCase()] ?? [],
  hasPosition,
  hasVyperVulnerability: isVyperVulnerablePool(chainId, pool.address),
  url: getPath({ network: blockchainId }, `${DEX_ROUTES.PAGE_POOLS}/${pool.address}`),
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
  const { chainId, blockchainId } = network
  const { address: userAddress } = useConnection()
  const isLite = isLiteChain(chainId)

  /** Network support */
  const litePoolChainsQuery = useLitePoolChains({}, isLite)
  const fullPoolChainsQuery = usePoolChains({}, !isLite)
  const poolListSupportQuery = useMappedQuery(
    isLite ? litePoolChainsQuery : fullPoolChainsQuery,
    useCallback(poolChains => poolChains.some(poolChain => poolChain.chainId === chainId), [chainId]),
  )
  const isSupported = poolListSupportQuery.data ?? false

  const userPoolPositionsParams = { chainId, userAddress }
  const { data: userPoolPositions, isFetching: isFetchingUserPoolPositions } = useUserPoolPositions(
    userPoolPositionsParams,
    isSupported,
  )
  const { data: campaignsByAddress } = useCampaigns({ blockchainId })

  const toPoolRow = useCallback(
    (poolData: PoolRowData) =>
      enrichPoolRow(poolData, {
        chainId,
        blockchainId,
        hasPosition: userPoolPositions?.positions.some(({ poolAddress }) =>
          isAddressEqual(poolAddress, poolData.address),
        ),
        campaignsByAddress,
      }),
    [chainId, blockchainId, campaignsByAddress, userPoolPositions],
  )

  /** Lite pools */
  const litePoolListParams = { chainId }
  const litePoolListQuery = useLitePoolList(litePoolListParams, isLite && isSupported)
  const litePoolListTableQuery = useMappedQuery(
    litePoolListQuery,
    useCallback(({ pools }) => pools.map(pool => toPoolRow(litePoolToRowData(pool))), [toPoolRow]),
  )

  /** Normal network pools */
  const poolListParams = {
    chainId,
    page,
    pageSize: POOLS_PAGE_SIZE,
    searchString: searchText || undefined,
    ...filters,
    sortBy,
    sortDirection,
  }
  const poolListQuery = usePoolList(poolListParams, !isLite && isSupported)
  const poolListTableQuery = useMappedQuery(
    poolListQuery,
    useCallback(({ pools }) => pools.map(pool => toPoolRow(poolToRowData(pool))), [toPoolRow]),
  )

  const tableQuery = poolListSupportQuery.data
    ? isLite
      ? litePoolListTableQuery
      : poolListTableQuery
    : q({
        data: undefined,
        isLoading: poolListSupportQuery.isLoading,
        error: poolListSupportQuery.data === false ? new UnsupportedPoolListError(chainId) : poolListSupportQuery.error,
      })

  return {
    isFetching:
      isFetchingUserPoolPositions ||
      (isLite
        ? litePoolChainsQuery.isFetching || litePoolListQuery.isFetching
        : fullPoolChainsQuery.isFetching || poolListQuery.isFetching),
    onReload: () =>
      Promise.all([
        resetPoolChains({}),
        resetLitePoolChains({}),
        resetLitePoolList(litePoolListParams),
        resetPoolList(poolListParams),
        resetUserPoolPositions(userPoolPositionsParams),
      ]),
    pageCount: isLite ? 1 : (poolListQuery.data?.pageCount ?? -1),
    userHasPositions: tableQuery.data?.some(({ hasPosition }) => hasPosition),
    tableQuery,
  }
}
