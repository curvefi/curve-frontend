import PromisePool from '@supercharge/promise-pool'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { createValidationSuite } from '@ui-kit/lib'
import {
  queryFactory,
  rootKeys,
  type ChainParams,
  type ChainQuery,
  type PoolParams,
  type PoolQuery,
} from '@ui-kit/lib/model'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { curveApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { poolValidationGroup } from '@ui-kit/lib/model/query/pool-validation'
import { getPoolIds, poolIdsQueryKey } from './pool-ids.query'

const getPoolTvlFromLib = ({ poolId }: Pick<PoolQuery, 'poolId'>) =>
  requireLib('curveApi').getPool(poolId).stats.totalLiquidity()

/** Hook to fetch the TVL for a single pool. */
export const { useQuery: usePoolTvl } = queryFactory({
  category: 'dex.pools',
  queryKey: ({ chainId, poolId }: PoolParams) => [...rootKeys.pool({ chainId, poolId }), 'stats.tvl'] as const,
  queryFn: async ({ poolId }: PoolQuery) => getPoolTvlFromLib({ poolId }),
  validationSuite: createValidationSuite((params: PoolParams) => {
    curveApiValidationGroup(params)
    chainValidationGroup(params)
    poolValidationGroup(params)
  }),
})

/**
 * Hook to fetch TVLs for multiple pools on the same chain.
 *
 * @remarks
 * Uses a single query keyed only by `chainId` (not per pool) to avoid 1000+ individual query
 * entries that slow down the front-end. Pools are fetched with `PromisePool` at concurrency 10
 * (multicall is not available for volume data). The poolIds are explicitly not part of the query key.
 */
export const { useQuery: usePoolTvls, fetchQuery: fetchPoolTvls } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => [...rootKeys.chain({ chainId }), 'stats.tvl'] as const,
  queryFn: async ({ chainId }: ChainQuery) => {
    const poolIds = getPoolIds({ chainId }) ?? []
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
  dependencies: (params) => [poolIdsQueryKey(params)],
})
