import type { IGaugesDataFromApi } from '@curvefi/api/lib/interfaces'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { hydratedQueryFactory } from '@evm-ui/hooks/useHydratedQuery'
import type { PoolParams, PoolQuery } from '@evm-ui/queries/query-types'
import { curvePoolValidationSuite } from '@evm-ui/queries/validation/pool-validation'

export const { useQuery: usePoolGaugeStatus, invalidate: invalidatePoolGaugeStatus } = hydratedQueryFactory({
  category: 'dex.gauge',
  queryKey: ({ chainId, poolAddress }: PoolParams) => ({ name: 'pool.gaugeStatus', chainId, poolAddress }) as const,
  queryFn: async ({ poolAddress }: PoolQuery) =>
    ((await requireLib('curveApi').getPool(poolAddress).gaugeStatus()) as IGaugesDataFromApi['gaugeStatus']) ?? null,
  validationSuite: curvePoolValidationSuite,
})
