import { useCallback, useMemo } from 'react'
import PromisePool from '@supercharge/promise-pool'
import { useQueries, type UseQueryResult } from '@tanstack/react-query'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { combineQueriesToObject, createValidationSuite, type FieldsOf, type QueryData } from '@ui-kit/lib'
import { queryClient } from '@ui-kit/lib/api'
import {
  queryFactory,
  REFRESH_INTERVAL,
  rootKeys,
  type ChainParams,
  type PoolParams,
  type PoolQuery,
} from '@ui-kit/lib/model'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { curveApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { poolValidationGroup } from '@ui-kit/lib/model/query/pool-validation'
import { useNetworks } from '../entities/networks'

export const QUERY_KEY_IDENTIFIER = 'pool-volume' as const

const {
  useQuery: usePoolVolumeQuery,
  getQueryOptions: getPoolVolumeQueryOptions,
  getQueryData: getPoolVolume,
} = queryFactory({
  queryKey: ({ chainId, poolId }: PoolParams) => [...rootKeys.pool({ chainId, poolId }), QUERY_KEY_IDENTIFIER] as const,
  queryFn: async ({ poolId }: PoolQuery) => await requireLib('curveApi').getPool(poolId).stats.volume(),
  validationSuite: createValidationSuite((params: PoolParams) => {
    curveApiValidationGroup(params)
    chainValidationGroup(params)
    poolValidationGroup(params)
  }),
})

export { getPoolVolume } // only used for tokens mapper, should be refactored away in the future

export function usePoolVolume(params: PoolParams) {
  const { data: networks } = useNetworks()
  const network = params?.chainId != null && networks[params.chainId]

  return usePoolVolumeQuery(params, network && !network.isLite)
}

type PoolVolumeData = QueryData<typeof usePoolVolumeQuery>

/**
 * Hook to fetch volumes for multiple pools on the same chain.
 *
 * @remarks
 *   Uses a higher `staleTime` and **no auto-refresh** (`refetchInterval`)
 *   to avoid performance issues when querying many pools at once.
 */
export function usePoolVolumes(
  { chainId, poolIds = [] }: FieldsOf<ChainParams> & { poolIds?: string[] },
  enabled: boolean = true,
) {
  const { data: networks } = useNetworks()
  const network = chainId != null && networks[chainId]
  const isEnabled = enabled && network && !network.isLite

  const uniquePoolIds = useMemo(() => [...new Set(poolIds)], [poolIds])

  return useQueries({
    queries: useMemo(
      () =>
        uniquePoolIds.map((poolId) => ({
          ...getPoolVolumeQueryOptions({ chainId: chainId!, poolId }, isEnabled),
          staleTime: REFRESH_INTERVAL['15m'],
          /**
           * Only re-render when data or error changes, not on metadata updates (e.g., fetchStatus, dataUpdatedAt).
           * This prevents 1000+ re-renders when many queries resolve in quick succession, like on userAddress or
           * chainId change with a new call to prefetchTokenBalances. If a 1000 tokens update, they all get a new
           * `updatedAt` despite the balance still being zero. We only want re-renders when balances actually change.
           */
          notifyOnChangeProps: ['data', 'error'] as const,
          retry: false,
        })),
      [chainId, uniquePoolIds, isEnabled],
    ),
    combine: useCallback(
      (results: UseQueryResult[]) => combineQueriesToObject(results as UseQueryResult<PoolVolumeData>[], uniquePoolIds),
      [uniquePoolIds],
    ),
  })
}

/**
 * Prefetch volumes for multiple pools into the query cache.
 *
 * Unlike token balances, pool volumes don't use on-chain multicall — each volume is fetched
 * from the Curve API independently. We use PromisePool to limit concurrency,
 * matching the original PromisePool.withConcurrency(10) behavior.
 */
export const prefetchPoolVolumes = async ({ chainId, poolIds }: ChainParams & { poolIds: string[] }) =>
  PromisePool.withConcurrency(10)
    .for([...new Set(poolIds)])
    .process((poolId) =>
      queryClient.prefetchQuery({
        ...getPoolVolumeQueryOptions({ chainId, poolId }),
        staleTime: REFRESH_INTERVAL['15m'],
        retry: false,
      }),
    )
