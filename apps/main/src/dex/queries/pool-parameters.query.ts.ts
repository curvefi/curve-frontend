import { requireLib } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { queryFactory, rootKeys, type PoolParams, type PoolQuery } from '@ui-kit/lib/model'
import { poolValidationSuite } from '@ui-kit/lib/model/query/pool-validation'

export const {
  useQuery: usePoolParameters,
  fetchQuery: fetchPoolParameters,
  invalidate: invalidatePoolParameters,
} = queryFactory({
  queryKey: ({ chainId, poolId }: PoolParams) => [...rootKeys.pool({ chainId, poolId }), 'pool-parameters'] as const,
  queryFn: async ({ poolId }: PoolQuery) => {
    const pool = requireLib('curveApi').getPool(poolId)
    if (pool.curve.isNoRPC) throw new Error(t`Connect your wallet to see pool parameters`)

    return await pool.stats.parameters()
  },
  validationSuite: poolValidationSuite,
})
