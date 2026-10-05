import { fulfilledValue } from '@/dex/utils'
import type { IGaugesDataFromApi } from '@curvefi/api/lib/interfaces'
import { requireLib, useCurve } from '@evm-ui/features/connect-wallet'
import type { PoolParams, PoolQuery } from '@evm-ui/queries/query-types'
import { curvePoolValidationSuite } from '@evm-ui/queries/validation/pool-validation'
import { queryFactory } from '@ui/features/queries/factory'

const { useQuery: usePoolGaugeStatusQuery, invalidate: invalidatePoolGaugeStatus } = queryFactory({
  category: 'dex.gauge',
  queryKey: ({ chainId, poolId }: PoolParams) => ({ name: 'status', chainId, poolId }) as const,
  queryFn: async ({ poolId }: PoolQuery) => {
    const pool = requireLib('curveApi').getPool(poolId)
    const [gaugeStatusResult, isGaugeKilledResult] = await Promise.allSettled([
      pool.gaugeStatus(),
      pool.isGaugeKilled(),
    ])

    return {
      // Curve JS types gaugeStatus() as any; use its API response type at this boundary.
      status: (fulfilledValue(gaugeStatusResult) as IGaugesDataFromApi['gaugeStatus']) ?? null,
      isKilled: fulfilledValue(isGaugeKilledResult) ?? null,
    }
  },
  validationSuite: curvePoolValidationSuite,
})

export { invalidatePoolGaugeStatus }

export function usePoolGaugeStatus(params: PoolParams) {
  const { isHydrated } = useCurve()
  return usePoolGaugeStatusQuery(params, isHydrated)
}
