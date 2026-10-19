import { requireLib } from '@evm-ui/features/connect-wallet'
import { useHydratedQuery } from '@evm-ui/hooks/useHydratedQuery'
import type { PoolParams, PoolQuery } from '@evm-ui/queries/query-types'
import { queryFactory } from '@ui/features/queries/factory'
import type { QueryData } from '@ui/features/queries/util'
import { poolLiquidityValidationSuite } from './pool-liquidity.validation'

const { useQuery: usePoolStoredRatesQuery } = queryFactory({
  queryKey: ({ chainId, poolAddress }: PoolParams) => ({ name: 'pool.storedRates', chainId, poolAddress }) as const,
  queryFn: async ({ poolAddress }: PoolQuery) => {
    const pool = requireLib('curveApi').getPool(poolAddress)
    return pool.isCrypto || pool.isLending || pool.isLlamma ? null : await pool.getStoredRates(false)
  },
  validationSuite: poolLiquidityValidationSuite,
  category: 'dex.pool',
})

export const usePoolStoredRates = (params: PoolParams, enabled = true) =>
  useHydratedQuery(usePoolStoredRatesQuery, params, enabled)

export type PoolStoredRates = QueryData<typeof usePoolStoredRates>
