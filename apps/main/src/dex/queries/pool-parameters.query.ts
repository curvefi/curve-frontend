import { requireLib } from '@evm-ui/features/connect-wallet'
import { hydratedQueryFactory } from '@evm-ui/hooks/useHydratedQuery'
import type { PoolParams, PoolQuery } from '@evm-ui/queries/query-types'
import { curvePoolValidationSuite } from '@evm-ui/queries/validation/pool-validation'

export const { useQuery: usePoolParameters, invalidate: invalidatePoolParameters } = hydratedQueryFactory({
  queryKey: ({ chainId, poolAddress }: PoolParams) =>
    ({ name: 'pool.stats.parameters', chainId, poolAddress }) as const,
  queryFn: async ({ poolAddress }: PoolQuery) => await requireLib('curveApi').getPool(poolAddress).stats.parameters(),
  validationSuite: curvePoolValidationSuite,
  category: 'dex.poolParams',
})
