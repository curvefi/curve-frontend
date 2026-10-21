import { requireLib } from '@evm-ui/features/connect-wallet'
import { useHydratedQuery } from '@evm-ui/hooks/useHydratedQuery'
import type { PoolParams, PoolQuery } from '@evm-ui/queries/query-types'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { poolLiquidityValidationSuite } from './pool-liquidity.validation'

const USE_UNDERLYING = false

const { useQuery: usePoolStoredRatesQuery } = queryFactory({
  queryKey: ({ chainId, poolAddress }: PoolParams) => ({ name: 'pool.storedRates', chainId, poolAddress }) as const,
  queryFn: async ({ poolAddress }: PoolQuery) => {
    const pool = requireLib('curveApi').getPool(poolAddress)
    return pool.isCrypto || pool.isLending || pool.isLlamma
      ? null
      : ((await pool.getStoredRates(USE_UNDERLYING)) as Decimal[])
  },
  validationSuite: poolLiquidityValidationSuite,
  category: 'dex.pool',
})

export const usePoolStoredRates = (params: PoolParams, enabled = true) =>
  useHydratedQuery(usePoolStoredRatesQuery, params, enabled)
