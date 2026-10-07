import { useCallback } from 'react'
import { asStellarContract } from '@/stellar/features/connect-wallet/address'
import { STELLAR_NETWORKS } from '@/stellar/lib/networks'
import type { NetworkQuery } from '@/stellar/queries/query-types'
import { StellarUrls } from '@/stellar/routes/routes'
import { useLitePoolList } from '@ui/features/pool-list/lite-pool-list.query'
import type { PoolRow } from '@ui/features/pool-list/types'
import { getPoolRates, litePoolToRowData } from '@ui/features/pool-list/utils'
import { useMappedQuery } from '@ui/features/queries/util'

export function usePoolList({ network }: NetworkQuery) {
  const chainId = STELLAR_NETWORKS[network].chainId
  const { data, isLoading, error, isFetching, refetch } = useLitePoolList({ chainId })
  const query = useMappedQuery(
    { data, isLoading, error },
    useCallback(
      ({ pools }): PoolRow[] =>
        pools
          .map(litePoolToRowData)
          .map(pool => ({
            ...pool,
            ...getPoolRates(pool),
            chainId,
            blockchainId: network,
            campaigns: [],
            userPosition: undefined,
            hasVyperVulnerability: undefined,
            url: StellarUrls.pool({ network, pool: asStellarContract(pool.address) }),
          })),
      [chainId, network],
    ),
  )
  return { ...query, isFetching, refetch }
}
