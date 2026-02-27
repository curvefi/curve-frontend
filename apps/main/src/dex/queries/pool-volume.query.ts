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
import { fetchNetworks, useNetworks } from '../entities/networks'
import { getPoolIds, poolIdsQueryKey } from './pool-ids.query'

const getPoolVolumeFromLib = ({ poolId }: Pick<PoolQuery, 'poolId'>) =>
  requireLib('curveApi').getPool(poolId).stats.volume()

const { useQuery: usePoolVolumeQuery } = queryFactory({
  queryKey: ({ chainId, poolId }: PoolParams) => [...rootKeys.pool({ chainId, poolId }), 'pool-volume'] as const,
  queryFn: async ({ poolId }: PoolQuery) => getPoolVolumeFromLib({ poolId }),
  validationSuite: createValidationSuite((params: PoolParams) => {
    curveApiValidationGroup(params)
    chainValidationGroup(params)
    poolValidationGroup(params)
  }),
})

/** Hook to fetch the trading volume for a single pool. Disabled on lite networks. */
export function usePoolVolume(params: PoolParams) {
  const { data: networks } = useNetworks()
  const network = params?.chainId != null && networks[params.chainId]

  return usePoolVolumeQuery(params, network && !network.isLite)
}

const { useQuery: usePoolVolumesQuery, fetchQuery: fetchPoolVolumesQuery } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => [...rootKeys.chain({ chainId }), 'pool-volumes'] as const,
  queryFn: async ({ chainId }: ChainQuery) => {
    const poolIds = getPoolIds({ chainId }) ?? []
    const { results } = await PromisePool.withConcurrency(10)
      .for(poolIds)
      .process(async (poolId) => [poolId, await getPoolVolumeFromLib({ poolId })] as const)

    return Object.fromEntries(results)
  },
  staleTime: '15m',
  validationSuite: createValidationSuite((params: ChainParams) => {
    curveApiValidationGroup(params)
    chainValidationGroup(params)
  }),
  dependencies: (params) => [poolIdsQueryKey(params)],
})

/**
 * Hook to fetch trading volumes for multiple pools on the same chain.
 *
 * @remarks
 * Uses a single query keyed only by `chainId` (not per pool) to avoid 1000+ individual query
 * entries that slow down the front-end. Pools are fetched with `PromisePool` at concurrency 10
 * (multicall is not available for volume data). The poolIds are explicitly not part of the query key.
 *
 * Disabled on lite networks.
 */
export function usePoolVolumes({ chainId }: ChainParams, enabled: boolean = true) {
  const { data: networks } = useNetworks()
  const network = chainId != null && networks[chainId]
  const isEnabled = enabled && !!network && !network.isLite

  return usePoolVolumesQuery({ chainId: chainId! }, isEnabled)
}

/**
 * Fetch trading volumes for multiple pools into the query cache.
 *
 * @remarks Skips fetching on lite networks.
 */
export async function fetchPoolVolumes(params: ChainParams) {
  const networks = await fetchNetworks()
  const network = networks?.[params?.chainId ?? 0]
  if (!network || network.isLite) return {}
  return fetchPoolVolumesQuery(params)
}
