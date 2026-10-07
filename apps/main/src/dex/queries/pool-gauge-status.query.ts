import { fulfilledValue } from '@/dex/utils'
import type { IGaugesDataFromApi } from '@curvefi/api/lib/interfaces'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { useHydratedQuery } from '@evm-ui/hooks/useHydratedQuery'
import type { PoolParams, PoolQuery } from '@evm-ui/queries/query-types'
import { chainValidationGroup } from '@evm-ui/queries/validation/chain-validation'
import { curveApiValidationGroup } from '@evm-ui/queries/validation/curve-api-validation'
import { poolValidationGroup } from '@evm-ui/queries/validation/pool-validation'
import { queryFactory } from '@ui/features/queries/factory'
import { createValidationSuite } from '@ui/lib/validation/lib'

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
  validationSuite: createValidationSuite((params: PoolParams) => {
    curveApiValidationGroup(params)
    chainValidationGroup(params)
    poolValidationGroup(params)
  }),
})

export { invalidatePoolGaugeStatus }

export const usePoolGaugeStatus = (params: PoolParams) => useHydratedQuery(usePoolGaugeStatusQuery, params)
