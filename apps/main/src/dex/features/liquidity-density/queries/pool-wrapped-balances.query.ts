import { requireLib } from '@evm-ui/features/connect-wallet'
import { useHydratedQuery } from '@evm-ui/hooks/useHydratedQuery'
import type { PoolParams, PoolQuery } from '@evm-ui/queries/query-types'
import { queryFactory } from '@ui/features/queries/factory'
import type { QueryData } from '@ui/features/queries/util'
import { poolLiquidityValidationSuite } from './pool-liquidity.validation'

const { useQuery: usePoolWrappedBalancesQuery } = queryFactory({
  queryKey: ({ chainId, poolAddress }: PoolParams) =>
    ({ name: 'pool.stats.wrappedBalances', chainId, poolAddress }) as const,
  queryFn: async ({ poolAddress }: PoolQuery) => {
    const pool = requireLib('curveApi').getPool(poolAddress)
    const { wrappedCoinAddresses, wrappedDecimals, isCrypto, isMeta, isLending, isLlamma } = pool
    return {
      balances: await pool.stats.wrappedBalances(),
      wrappedCoinAddresses,
      wrappedDecimals,
      isCrypto,
      isMeta,
      isLending,
      isLlamma,
    }
  },
  validationSuite: poolLiquidityValidationSuite,
  category: 'dex.pool',
})

export const usePoolWrappedBalances = (params: PoolParams, enabled = true) =>
  useHydratedQuery(usePoolWrappedBalancesQuery, params, enabled)

export type PoolWrappedBalances = QueryData<typeof usePoolWrappedBalances>
