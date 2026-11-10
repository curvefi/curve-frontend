import { requireLib } from '@evm-ui/features/connect-wallet'
import { hydratedQueryFactory } from '@evm-ui/hooks/useHydratedQuery'
import type { PoolParams, PoolQuery } from '@evm-ui/queries/query-types'
import type { Decimal } from '@primitives/decimal.utils'
import { poolLiquidityValidationSuite } from './pool-liquidity.validation'

const USE_UNDERLYING = false

export const { useQuery: usePoolStoredRates } = hydratedQueryFactory({
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
