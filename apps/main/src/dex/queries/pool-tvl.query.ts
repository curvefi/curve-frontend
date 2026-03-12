import PromisePool from '@supercharge/promise-pool'
import { requireLib, useCurve } from '@ui-kit/features/connect-wallet'
import { createValidationSuite } from '@ui-kit/lib'
import { queryFactory, rootKeys, type ChainParams, type PoolParams, type PoolQuery } from '@ui-kit/lib/model'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { curveApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { poolValidationGroup } from '@ui-kit/lib/model/query/pool-validation'

const getPoolTvlFromLib = ({ poolId }: Pick<PoolQuery, 'poolId'>) =>
  requireLib('curveApi').getPool(poolId).stats.totalLiquidity()

const { useQuery: usePoolTvlQuery } = queryFactory({
  category: 'dex.pools',
  queryKey: ({ chainId, poolId }: PoolParams) => [...rootKeys.pool({ chainId, poolId }), 'stats.tvl'] as const,
  queryFn: async ({ poolId }: PoolQuery) => getPoolTvlFromLib({ poolId }),
  validationSuite: createValidationSuite((params: PoolParams) => {
    curveApiValidationGroup(params)
    chainValidationGroup(params)
    poolValidationGroup(params)
  }),
})

/** Hook to fetch the TVL for a single pool. */
export function usePoolTvl({ chainId, poolId }: PoolParams) {
  const { isHydrated } = useCurve()
  return usePoolTvlQuery({ chainId, poolId }, isHydrated)
}

const { useQuery: usePoolTvlsQuery, refetchQuery: refetchPoolTvls } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => [...rootKeys.chain({ chainId }), 'stats.tvl'] as const,
  queryFn: async () => {
    const poolIds = requireLib('curveApi').getPoolList()
    const { results } = await PromisePool.withConcurrency(10)
      .for(poolIds)
      .process(async (poolId) => [poolId, await getPoolTvlFromLib({ poolId })] as const)

    return Object.fromEntries(results)
  },
  category: 'dex.pools',
  validationSuite: createValidationSuite((params: ChainParams) => {
    curveApiValidationGroup(params)
    chainValidationGroup(params)
  }),
})

export { refetchPoolTvls }

/**
 * Hook to fetch TVLs for multiple pools on the same chain.
 *
 * @remarks
 * Uses a single query keyed only by `chainId` (not per pool) to avoid 1000+ individual query
 * entries that slow down the front-end. Pools are fetched with `PromisePool` at concurrency 10
 * (multicall is not available for tvl data, as the data comes from an API endpoint).
 * The poolIds are explicitly not part of the query key. The query reads the currently hydrated
 * curve instance directly, so DEX hydration must manually refetch this query after pool bootstrap.
 */
export function usePoolTvls({ chainId }: ChainParams) {
  const { isHydrated } = useCurve()
  return usePoolTvlsQuery({ chainId }, isHydrated)
}
