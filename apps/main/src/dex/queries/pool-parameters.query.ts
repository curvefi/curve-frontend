import { requireLib } from '@evm-ui/features/connect-wallet'
import { hydratedQueryFactory } from '@evm-ui/hooks/useHydratedQuery'
import type { PoolParams, PoolQuery } from '@evm-ui/queries/query-types'
import { curveApiValidationGroup } from '@evm-ui/queries/validation/curve-api-validation'
import { poolValidationGroup } from '@evm-ui/queries/validation/pool-validation'
import type { QueryData } from '@ui/features/queries/util'
import { createValidationSuite } from '@ui/lib/validation/lib'

export const { useQuery: usePoolParameters, invalidate: invalidatePoolParameters } = hydratedQueryFactory({
  queryKey: ({ chainId, poolAddress }: PoolParams) =>
    ({ name: 'pool.stats.parameters', chainId, poolAddress }) as const,
  queryFn: async ({ poolAddress }: PoolQuery) => await requireLib('curveApi').getPool(poolAddress).stats.parameters(),
  validationSuite: createValidationSuite((params: PoolParams) => {
    poolValidationGroup(params)
    curveApiValidationGroup(params, { requireRpc: true })
  }),
  category: 'dex.poolParams',
})

export type PoolParameters = QueryData<typeof usePoolParameters>
