import { requireLib } from '@evm-ui/features/connect-wallet'
import { hydratedQueryFactory } from '@evm-ui/hooks/useHydratedQuery'
import type { PoolParams, PoolQuery } from '@evm-ui/queries/query-types'
import { curvePoolValidationSuite } from '@evm-ui/queries/validation/pool-validation'
import { fetchGaugeStatus } from '@ui/lib/gauge-status'

/** Whether the pool gauge receives CRV: `active`, `inactive` when killed, or `null` without an approved gauge. */
export const { useQuery: usePoolGaugeStatus, invalidate: invalidatePoolGaugeStatus } = hydratedQueryFactory({
  category: 'dex.gauge',
  queryKey: ({ chainId, poolAddress }: PoolParams) => ({ name: 'pool.gaugeStatus', chainId, poolAddress }) as const,
  queryFn: async ({ poolAddress }: PoolQuery) => {
    const pool = requireLib('curveApi').getPool(poolAddress)
    return await fetchGaugeStatus({
      isRegistered: () => pool.isGaugeRegistered(),
      isKilled: () => pool.isGaugeKilled(),
    })
  },
  validationSuite: curvePoolValidationSuite,
})
