import { useCallback } from 'react'
import { isAddressEqual } from 'viem'
import { useConnection } from 'wagmi'
import { resetPoolLists } from '@/dex/queries/invalidation'
import { useLitePoolChains, usePoolChains, usePoolList } from '@/dex/queries/pool-list.query'
import type { NetworkConfig } from '@/dex/types/main.types'
import type {
  LitePool,
  SortDirection as PoolSortDirection,
  V2Pool,
  V2PoolSortField as PoolSortField,
} from '@curvefi/prices-api/pools'
import { isLiteChain } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import { useCampaigns } from '@evm-ui/queries/campaigns'
import type { Address } from '@primitives/address.utils'
import { maybe } from '@primitives/objects.utils'
import type { PoolsApiParams } from '@ui/features/pool-list/filters/utils'
import { POOLS_PAGE_SIZE } from '@ui/features/pool-list/hooks/usePoolsPagination'
import { useLitePoolList } from '@ui/features/pool-list/lite-pool-list.query'
import { litePoolToRowData, poolToRowData } from '@ui/features/pool-list/utils'
import { DISABLED_Q, mapQuery, q, useMappedQuery } from '@ui/features/queries/util'
import { enrichPoolRow, getPoolListAlerts } from '../utils'
import { useUserPoolPositions, type UserPoolPositions } from './useUserPoolPositions'

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
    userHasPositions: tableQuery.data?.some(({ userPosition }) => userPosition && +userPosition.lpBalance > 0),
    tableQuery,
    alerts: getPoolListAlerts(tableQuery.data, blockchainId),
  }
}
