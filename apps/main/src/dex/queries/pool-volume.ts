import { requireLib } from '@ui-kit/features/connect-wallet'
import { queryFactory, rootKeys, type PoolQuery, type PoolParams } from '@ui-kit/lib/model'
import { poolValidationSuite } from '@ui-kit/lib/model/query/pool-validation'
import { decimal } from '@ui-kit/utils'
import { fetchNetworks } from '../entities/networks'

export const {
  useQuery: usePoolVolume,
  fetchQuery: fetchPoolVolume,
  getQueryData: getPoolVolume,
} = queryFactory({
  queryKey: ({ chainId, poolId }: PoolParams) => [...rootKeys.pool({ chainId, poolId }), 'volume'] as const,
  queryFn: async ({ chainId, poolId }: PoolQuery) => {
    // Lite networks do not support volume
    const networks = await fetchNetworks()
    if (networks[chainId].isLite) {
      return null
    }

    const curve = requireLib('curveApi')
    const pool = curve.getPool(poolId)
    const volume = await pool.stats.volume()
    return decimal(volume)
  },
  staleTime: '5m',
  validationSuite: poolValidationSuite,
})
