import { useCallback } from 'react'
import { asAddress } from '@/stellar/features/connect-wallet/address'
import { STELLAR_NETWORKS } from '@/stellar/lib/networks'
import type { PoolQuery } from '@/stellar/queries/query-types'
import { useLitePoolList } from '@ui/features/pool-list/lite-pool-list.query'
import { useMappedQuery } from '@ui/features/queries/util'

/** Keep the raw detail fields and distinguish an unindexed pool from an unavailable API. */
export const useLitePool = ({ network, pool }: PoolQuery) => {
  const chainId = STELLAR_NETWORKS[network].chainId
  const { isFetching, refetch, dataUpdatedAt, data: poolList, isLoading, error } = useLitePoolList({ chainId })
  const query = useMappedQuery(
    { data: poolList, isLoading, error },
    useCallback(
      ({ pools }) =>
        pools.find(candidate => candidate.chainId === chainId && candidate.address === asAddress(pool)) ?? null,
      [chainId, pool],
    ),
  )
  const generatedTimeMs = poolList?.generatedTimeMs
  const isMissing = !!poolList?.pools && !query.data
  return { query, isMissing, generatedTimeMs, dataUpdatedAt, isFetching, refetch }
}
