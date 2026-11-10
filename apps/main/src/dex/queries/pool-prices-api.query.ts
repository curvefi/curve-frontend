import { getPoolV2 } from '@curvefi/prices-api/pools'
import type { PoolParams, PoolQuery } from '@evm-ui/queries/query-types'
import { poolValidationSuite } from '@evm-ui/queries/validation/pool-validation'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: usePoolPricesApi, fetchQuery: fetchPoolPricesApi } = queryFactory({
  queryKey: ({ chainId, poolAddress }: PoolParams) =>
    ({ name: 'pool-prices-api', chainId, poolAddress, version: 1 }) as const,
  queryFn: async (params: PoolQuery) => await getPoolV2(params),
  validationSuite: poolValidationSuite,
  category: 'dex.pool',
})
