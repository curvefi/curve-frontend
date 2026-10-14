import { asAddress } from '@/stellar/features/connect-wallet/address'
import { STELLAR_NETWORKS } from '@/stellar/lib/networks'
import type { PoolQuery } from '@/stellar/queries/query-types'
import { useLitePoolList } from '@ui/features/pool-list/lite-pool-list.query'
import { mapQuery } from '@ui/features/queries/util'

/** Keep the raw detail fields and distinguish an unindexed pool from an unavailable API. */
export const useLitePool = ({ network, pool }: PoolQuery) => {
  const chainId = STELLAR_NETWORKS[network].chainId
  const result = useLitePoolList({ chainId })
  const query = mapQuery(
    result,
    ({ pools }) =>
      pools.find(candidate => candidate.chainId === chainId && candidate.address === asAddress(pool)) ?? null,
  )
  return {
    query,
    isMissing: query.data === null,
    generatedTimeMs: result.data?.generatedTimeMs,
    dataUpdatedAt: result.dataUpdatedAt,
    isFetching: result.isFetching,
    refetch: result.refetch,
  }
}
