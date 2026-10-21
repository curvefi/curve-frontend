import { requireLib } from '@evm-ui/features/connect-wallet'
import { useHydratedQuery } from '@evm-ui/hooks/useHydratedQuery'
import type { PoolParams, PoolQuery } from '@evm-ui/queries/query-types'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { poolLiquidityValidationSuite } from './pool-liquidity.validation'

const { useQuery: usePoolWrappedBalancesQuery } = queryFactory({
  queryKey: ({ chainId, poolAddress }: PoolParams) =>
    ({ name: 'pool.stats.wrappedBalances', chainId, poolAddress }) as const,
  queryFn: async ({ poolAddress }: PoolQuery) =>
    (await requireLib('curveApi').getPool(poolAddress).stats.wrappedBalances()) as Decimal[],
  validationSuite: poolLiquidityValidationSuite,
  category: 'dex.pool',
})

export const usePoolWrappedBalances = (params: PoolParams, enabled = true) =>
  useHydratedQuery(usePoolWrappedBalancesQuery, params, enabled)
