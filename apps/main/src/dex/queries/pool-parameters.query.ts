import { requireLib } from '@evm-ui/features/connect-wallet'
import { createValidationSuite } from '@evm-ui/lib'
import { queryFactory, rootKeys, type PoolParams, type PoolQuery } from '@evm-ui/lib/model'
import { chainValidationGroup } from '@evm-ui/lib/model/query/chain-validation'
import { curveApiValidationGroup } from '@evm-ui/lib/model/query/curve-api-validation'
import { poolValidationGroup } from '@evm-ui/lib/model/query/pool-validation'

export const { useQuery: usePoolParameters, invalidate: invalidatePoolParameters } = queryFactory({
  queryKey: ({ chainId, poolId }: PoolParams) => [...rootKeys.pool({ chainId, poolId }), 'pool-parameters'] as const,
  queryFn: async ({ poolId }: PoolQuery) => await requireLib('curveApi').getPool(poolId).stats.parameters(),
  validationSuite: createValidationSuite((params: PoolParams) => {
    curveApiValidationGroup(params, { requireRpc: true })
    chainValidationGroup(params)
    poolValidationGroup(params)
  }),
  category: 'dex.poolParams',
})
