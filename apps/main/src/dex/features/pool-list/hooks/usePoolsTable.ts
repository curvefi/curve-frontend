import { useCallback } from 'react'
import { isAddressEqual } from 'viem'
import { useConnection } from 'wagmi'
import { resetPoolLists } from '@/dex/queries/invalidation'
import { useLitePoolChains, useLitePoolList, usePoolChains, usePoolList } from '@/dex/queries/pool-list.query'
import { useUserPoolPositions } from '@/dex/queries/user-pool-positions.query'
import type { NetworkConfig } from '@/dex/types/main.types'
import type {
  LitePool,
  SortDirection as PoolSortDirection,
  V2Pool,
  V2PoolSortField as PoolSortField,
} from '@curvefi/prices-api/pools'
import { useCampaigns } from '@evm-ui/entities/campaigns'
import { isLiteChain } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import { useCombinedQueries } from '@evm-ui/lib'
import { constQ, mapQuery, q, useMappedQuery } from '@ui/features/queries/util'
import type { PoolsApiParams } from '../filters/utils'
import { enrichPoolRow, litePoolToRowData, poolToRowData } from '../utils'
import { POOLS_PAGE_SIZE } from './usePoolsPagination'

class UnsupportedPoolListError extends Error {
  constructor(readonly chainId: number) {
    super(`The pool list is not supported on chain ${chainId}`)
    this.name = 'UnsupportedPoolListError'
  }
}

const litePoolsToRows = ({ pools }: { pools: LitePool[] }) => pools.map(litePoolToRowData)
const poolsToRows = ({ pools }: { pools: V2Pool[] }) => pools.map(poolToRowData)

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
  const litePoolChains = useLitePoolChains({}, isLite)
  const fullPoolChains = usePoolChains({}, !isLite)
  const poolListSupport = mapQuery(isLite ? litePoolChains : fullPoolChains, poolChains =>
    poolChains.some(poolChain => poolChain.chainId === chainId),
  )
  const isSupported = poolListSupport.data ?? false

  const campaigns = useCampaigns({ blockchainId })
  const positions = useUserPoolPositions({ chainId, userAddress }, isSupported)
  const litePoolList = useLitePoolList({ chainId }, isLite && isSupported)
  const poolList = usePoolList(
    {
      chainId,
      page,
      pageSize: POOLS_PAGE_SIZE,
      searchString: searchText || undefined,
      ...filters,
      sortBy,
      sortDirection,
    },
    !isLite && isSupported,
  )

  const litePoolRows = useMappedQuery(litePoolList, litePoolsToRows)
  const poolRows = useMappedQuery(poolList, poolsToRows)

  // constQ suppresses loading state, and ?? null allows useCombinedQueries to run even when data is not yet loaded or present.
  const enrichedPools = useCombinedQueries(
    [isLite ? litePoolRows : poolRows, constQ(network), constQ(campaigns.data), constQ(positions.data ?? null)],
    useCallback(
      (pools, network, campaigns, positions) =>
        pools.map(pool =>
          enrichPoolRow(pool, network, campaigns, {
            lpBalance:
              positions?.positions.find(({ address }) => isAddressEqual(address, pool.address))?.totalBalance ?? '0',
          }),
        ),
      [],
    ),
  )

  const tableQuery = poolListSupport.data
    ? enrichedPools
    : q({
        data: undefined,
        isLoading: poolListSupport.isLoading,
        error: poolListSupport.data === false ? new UnsupportedPoolListError(chainId) : poolListSupport.error,
      })

  return {
    isFetching:
      positions.isFetching ||
      campaigns.isLoading ||
      (isLite
        ? litePoolChains.isFetching || litePoolList.isFetching
        : fullPoolChains.isFetching || poolList.isFetching),
    onReload: () => resetPoolLists({ chainId, userAddress }),
    pageCount: isLite ? 1 : (poolList.data?.pageCount ?? -1),
    userHasPositions: tableQuery.data?.some(({ userPosition }) => +userPosition.lpBalance > 0),
    tableQuery,
  }
}
