import { requireLib } from '@evm-ui/features/connect-wallet'
import { hydratedQueryFactory } from '@evm-ui/hooks/useHydratedQuery'
import type { PoolParams, PoolQuery } from '@evm-ui/queries/query-types'
import type { Decimal } from '@primitives/decimal.utils'
import { poolLiquidityValidationSuite } from './pool-liquidity.validation'

export const { useQuery: usePoolStoredRates } = hydratedQueryFactory({
  queryKey: ({ chainId, poolAddress, isWrapped }: PoolParams & { isWrapped: boolean }) =>
    ({ name: 'pool.storedRates', chainId, poolAddress, isWrapped }) as const,
  queryFn: async ({ poolAddress, isWrapped }: PoolQuery & { isWrapped: boolean }) => {
    const pool = requireLib('curveApi').getPool(poolAddress)
    return pool.isCrypto || pool.isLending || pool.isLlamma
      ? null
      : ((await pool.getStoredRates(!isWrapped)) as Decimal[])
  },
  validationSuite: poolLiquidityValidationSuite,
  category: 'dex.pool',
})
