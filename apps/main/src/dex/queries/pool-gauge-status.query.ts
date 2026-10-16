import type { IGaugesDataFromApi } from '@curvefi/api/lib/interfaces'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { useHydratedQuery } from '@evm-ui/hooks/useHydratedQuery'
import type { PoolParams, PoolQuery } from '@evm-ui/queries/query-types'
import { curvePoolValidationSuite } from '@evm-ui/queries/validation/pool-validation'
import { queryFactory } from '@ui/features/queries/factory'

const { useQuery: usePoolGaugeStatusQuery, invalidate: invalidatePoolGaugeStatus } = queryFactory({
  category: 'dex.gauge',
  queryKey: ({ chainId, poolAddress }: PoolParams) => ({ name: 'pool.gaugeStatus', chainId, poolAddress }) as const,
  queryFn: async ({ poolAddress }: PoolQuery) =>
    ((await requireLib('curveApi').getPool(poolAddress).gaugeStatus()) as IGaugesDataFromApi['gaugeStatus']) ?? null,
  validationSuite: curvePoolValidationSuite,
})

export { invalidatePoolGaugeStatus }

export const usePoolGaugeStatus = (params: PoolParams) => useHydratedQuery(usePoolGaugeStatusQuery, params)
