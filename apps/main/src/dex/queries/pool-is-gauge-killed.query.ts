import { requireLib } from '@evm-ui/features/connect-wallet'
import { useHydratedQuery } from '@evm-ui/hooks/useHydratedQuery'
import type { PoolParams, PoolQuery } from '@evm-ui/queries/query-types'
import { curvePoolValidationSuite } from '@evm-ui/queries/validation/pool-validation'
import { queryFactory } from '@ui/features/queries/factory'

const { useQuery: usePoolIsGaugeKilledQuery, invalidate: invalidatePoolIsGaugeKilled } = queryFactory({
  category: 'dex.gauge',
  queryKey: ({ chainId, poolAddress }: PoolParams) => ({ name: 'pool.isGaugeKilled', chainId, poolAddress }) as const,
  queryFn: async ({ poolAddress }: PoolQuery) => await requireLib('curveApi').getPool(poolAddress).isGaugeKilled(),
  validationSuite: curvePoolValidationSuite,
})

export { invalidatePoolIsGaugeKilled }

export const usePoolIsGaugeKilled = (params: PoolParams) => useHydratedQuery(usePoolIsGaugeKilledQuery, params)
