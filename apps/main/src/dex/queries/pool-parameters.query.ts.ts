import { requireLib } from '@ui-kit/features/connect-wallet'
import { createValidationSuite } from '@ui-kit/lib'
import { queryFactory, rootKeys, type PoolParams, type PoolQuery } from '@ui-kit/lib/model'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { curveApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { poolValidationGroup } from '@ui-kit/lib/model/query/pool-validation'

export const {
  useQuery: usePoolParameters,
  fetchQuery: fetchPoolParameters,
  invalidate: invalidatePoolParameters,
} = queryFactory({
  queryKey: ({ chainId, poolId }: PoolParams) => [...rootKeys.pool({ chainId, poolId }), 'pool-parameters'] as const,
  queryFn: async ({ poolId }: PoolQuery) => await requireLib('curveApi').getPool(poolId).stats.parameters(),
  validationSuite: createValidationSuite((params: PoolParams) => {
    curveApiValidationGroup(params)
    chainValidationGroup(params)
    poolValidationGroup(params)
  }),
  staleTime: '15m',
})
