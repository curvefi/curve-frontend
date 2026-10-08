import { requireLib } from '@evm-ui/features/connect-wallet'
import type { PoolParams, PoolQuery } from '@evm-ui/queries/query-types'
import { curvePoolValidationSuite } from '@evm-ui/queries/validation/pool-validation'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: usePoolParameters, invalidate: invalidatePoolParameters } = queryFactory({
  queryKey: ({ chainId, poolId }: PoolParams) => ({ name: 'pool.stats.parameters', chainId, poolId }) as const,
  queryFn: async ({ poolId }: PoolQuery) => await requireLib('curveApi').getPool(poolId).stats.parameters(),
  validationSuite: curvePoolValidationSuite,
  category: 'dex.poolParams',
})
