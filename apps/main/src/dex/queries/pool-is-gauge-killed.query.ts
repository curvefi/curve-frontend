import { requireLib, useCurve } from '@evm-ui/features/connect-wallet'
import type { PoolParams, PoolQuery } from '@evm-ui/queries/query-types'
import { curvePoolValidationSuite } from '@evm-ui/queries/validation/pool-validation'
import { queryFactory } from '@ui/features/queries/factory'

const { useQuery: usePoolIsGaugeKilledQuery, invalidate: invalidatePoolIsGaugeKilled } = queryFactory({
  category: 'dex.gauge',
  queryKey: ({ chainId, poolId }: PoolParams) => ({ name: 'pool.isGaugeKilled', chainId, poolId }) as const,
  queryFn: async ({ poolId }: PoolQuery) => await requireLib('curveApi').getPool(poolId).isGaugeKilled(),
  validationSuite: curvePoolValidationSuite,
})

export { invalidatePoolIsGaugeKilled }

export function usePoolIsGaugeKilled(params: PoolParams) {
  const { isHydrated } = useCurve()
  return usePoolIsGaugeKilledQuery(params, isHydrated)
}
