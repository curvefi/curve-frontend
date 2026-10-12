import { useCallback } from 'react'
import { isAddressEqual } from 'viem'
import { useConnection } from 'wagmi'
import { resetPoolLists } from '@/dex/queries/invalidation'
import { useLitePoolChains, usePoolChains, usePoolList } from '@/dex/queries/pool-list.query'
import type { NetworkConfig } from '@/dex/types/main.types'
import type { LitePool, V2Pool } from '@curvefi/prices-api/pools'
import { isLiteChain } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import { useCampaigns } from '@evm-ui/queries/campaigns/campaigns.query'
import type { Address } from '@primitives/address.utils'
import { maybe } from '@primitives/objects.utils'
import { usePoolsFilters } from '@ui/features/pool-list/hooks/usePoolsFilters'
import { POOLS_PAGE_SIZE, usePoolsPagination } from '@ui/features/pool-list/hooks/usePoolsPagination'
import { usePoolsSorting } from '@ui/features/pool-list/hooks/usePoolsSorting'
import { useLitePoolList } from '@ui/features/pool-list/lite-pool-list.query'
import type { PoolsTableProps } from '@ui/features/pool-list/PoolsTable'
import type { PoolsTableData } from '@ui/features/pool-list/types'
import { litePoolToRowData, poolToRowData } from '@ui/features/pool-list/utils'
import { DISABLED_Q, mapQuery, q, useMappedQuery } from '@ui/features/queries/util'
import { enrichPoolRow, getPoolListAlerts } from '../utils'
import { type UserPoolPositions, useUserPoolPositions } from './useUserPoolPositions'

class UnsupportedPoolListError extends Error {
  constructor(readonly chainId: number) {
    super(`The pool list is not supported on chain ${chainId}`)
    this.name = 'UnsupportedPoolListError'
  }
}

const litePoolsToRows = ({ pools }: { pools: LitePool[] }) => pools.map(litePoolToRowData)
const poolsToRows = ({ pools }: { pools: V2Pool[] }) => pools.map(poolToRowData)

/** Public pool rows show known balances but do not fetch claimables. */
const getPoolUserPosition = (poolAddress: Address, positions: UserPoolPositions | undefined) =>
  maybe(
    positions?.find(({ address }) => isAddressEqual(address, poolAddress)),
    p => ({ lpBalance: p.totalBalance, depositsUsd: DISABLED_Q, claimables: DISABLED_Q, claimablesUsd: DISABLED_Q }),
  )

/** Fetches the selected pool-list source and maps its API rows into table rows. */
export const usePoolsTable = (
  network: NetworkConfig,
): PoolsTableData & Pick<PoolsTableProps, 'pagination' | 'filters' | 'sorting' | 'isLite'> => {
  const { chainId, blockchainId } = network
  const { address: userAddress } = useConnection()
  const isLite = isLiteChain(chainId)

  /** Network support */
  const litePoolChains = useLitePoolChains({}, isLite)
  const fullPoolChains = usePoolChains({}, !isLite)
  const poolListSupport = mapQuery(isLite ? litePoolChains : fullPoolChains, poolChains =>
    poolChains.some(poolChain => poolChain.chainId === chainId),
  )
  const isSupported = poolListSupport.data ?? false

  const campaigns = useCampaigns({ blockchainId })
  const positions = useUserPoolPositions({ chainId, userAddress }, isSupported)
  const litePoolList = useLitePoolList({ chainId }, isLite && isSupported)

  const pagination = usePoolsPagination()
  const filters = usePoolsFilters()
  const sorting = usePoolsSorting(isLite, pagination.updateQueryAndResetPage)
  const poolList = usePoolList(
    {
      chainId,
      page: pagination.pagination.pageIndex + 1,
      pageSize: POOLS_PAGE_SIZE,
      searchString: filters.searchText || undefined,
      ...(!isLite && filters.apiParams),
      sortBy: sorting.sortBy,
      sortDirection: sorting.sortDirection,
    },
    !isLite && isSupported,
  )

  const litePoolRows = useMappedQuery(litePoolList, litePoolsToRows)
  const poolRows = useMappedQuery(poolList, poolsToRows)

  const enrichedPools = useMappedQuery(
    isLite ? litePoolRows : poolRows,
    useCallback(
      pools =>
        pools.map(pool =>
          enrichPoolRow(pool, network, campaigns.data, getPoolUserPosition(pool.address, positions.data)),
        ),
      [network, campaigns.data, positions.data],
    ),
  )

  return {
    pagination,
    filters,
    sorting,
    isLite,
    isFetching:
      positions.isFetching ||
      campaigns.isLoading ||
      (isLite
        ? litePoolChains.isFetching || litePoolList.isFetching
        : fullPoolChains.isFetching || poolList.isFetching),
    onReload: () => resetPoolLists({ chainId, userAddress }),
    pageCount: isLite ? 1 : (poolList.data?.pageCount ?? -1),
    userHasPositions: enrichedPools.data?.some(({ userPosition }) => userPosition && +userPosition.lpBalance > 0),
    tableQuery: poolListSupport.data
      ? enrichedPools
      : q({
          data: undefined,
          isLoading: poolListSupport.isLoading,
          error: poolListSupport.data === false ? new UnsupportedPoolListError(chainId) : poolListSupport.error,
        }),
    alerts: getPoolListAlerts(enrichedPools.data, blockchainId),
  }
}
