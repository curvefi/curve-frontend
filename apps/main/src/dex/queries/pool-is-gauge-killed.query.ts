import { requireLib, useCurve } from '@evm-ui/features/connect-wallet'
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

export function usePoolIsGaugeKilled(params: PoolParams) {
  const { isHydrated } = useCurve()
  return usePoolIsGaugeKilledQuery(params, isHydrated)
}
