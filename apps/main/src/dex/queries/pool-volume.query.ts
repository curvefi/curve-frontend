import type { Address } from '@primitives/address.utils'
import { requireLib, useCurve } from '@ui-kit/features/connect-wallet'
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

const { useQuery: usePoolVolumeQuery } = queryFactory({
  category: 'dex.pools',
  queryKey: ({ chainId, poolId }: PoolParams) => [...rootKeys.pool({ chainId, poolId }), 'stats.volume'] as const,
  queryFn: async ({ poolId }: PoolQuery) => await requireLib('curveApi').getPool(poolId).stats.volume(),
  validationSuite: createValidationSuite((params: PoolParams) => {
    curveApiValidationGroup(params)
    chainValidationGroup(params)
    poolValidationGroup(params)
  }),
})

/** Hook to fetch the trading volume for a single pool. Disabled on lite networks. */
export function usePoolVolume({ chainId, poolId }: PoolParams) {
  const { isHydrated } = useCurve()
  const { data: networks } = useNetworks()
  const network = chainId != null && networks[chainId]

  return usePoolVolumeQuery({ chainId, poolId }, isHydrated && network && !network.isLite)
}

const { useQuery: usePoolVolumesQuery, refetchQuery: refetchPoolVolumesQuery } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => [...rootKeys.chain({ chainId }), 'stats.volume'] as const,
  queryFn: async (_params: ChainQuery) => {
    const curveApi = requireLib('curveApi')
    const volumesByAddress = await curveApi.getPoolVolumes()

    return Object.fromEntries(
      curveApi.getPoolList().map(poolId => {
        const poolAddress = curveApi.getPool(poolId).address.toLowerCase() as Address
        return [poolId, volumesByAddress[poolAddress] ?? '0']
      }),
    )
  },
  category: 'dex.pools',
  validationSuite: createValidationSuite((params: ChainParams) => {
    curveApiValidationGroup(params)
    chainValidationGroup(params)
  }),
})

/**
 * Hook to fetch trading volumes for multiple pools on the same chain.
 *
 * @remarks
 * Uses a single query keyed only by `chainId` (not per pool) to avoid 1000+ individual query
 * entries that slow down the front-end. Volumes are fetched from curve-js in one API request.
 * The poolIds are explicitly not part of the query key. The query reads the currently hydrated
 * curve instance directly, so DEX hydration must manually refetch this query after pool bootstrap.
 *
 * Disabled on lite networks.
 */
export function usePoolVolumes({ chainId }: ChainParams) {
  const { isHydrated } = useCurve()
  const { data: networks } = useNetworks()
  const network = chainId != null && networks[chainId]

  return usePoolVolumesQuery({ chainId }, isHydrated && network && !network.isLite)
}

/**
 * Refetch trading volumes for multiple pools into the query cache.
 *
 * @remarks Skips fetching on lite networks. Assumes the api is hydrated.
 */
export async function refetchPoolVolumes({ chainId }: ChainParams) {
  const networks = await fetchNetworks()
  const network = networks?.[chainId ?? 0]
  if (!network || network.isLite) return {}
  return refetchPoolVolumesQuery({ chainId })
}
