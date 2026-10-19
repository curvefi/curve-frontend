import { requireLib } from '@evm-ui/features/connect-wallet'
import type { PoolParams, PoolQuery } from '@evm-ui/queries/query-types'
import { curvePoolValidationSuite } from '@evm-ui/queries/validation/pool-validation'
import { queryFactory } from '@ui/features/queries/factory'
import type { QueryData } from '@ui/features/queries/util'

export const { useQuery: usePoolParameters, invalidate: invalidatePoolParameters } = queryFactory({
  queryKey: ({ chainId, poolAddress }: PoolParams) =>
    ({ name: 'pool.stats.parameters', chainId, poolAddress }) as const,
  queryFn: async ({ poolAddress }: PoolQuery) => await requireLib('curveApi').getPool(poolAddress).stats.parameters(),
  validationSuite: curvePoolValidationSuite,
  category: 'dex.poolParams',
})

export type PoolParameters = QueryData<typeof usePoolParameters>
