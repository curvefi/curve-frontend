import { requireLib } from '@evm-ui/features/connect-wallet'
import { useHydratedQuery } from '@evm-ui/hooks/useHydratedQuery'
import type { PoolParams, PoolQuery } from '@evm-ui/queries/query-types'
import { curvePoolValidationSuite } from '@evm-ui/queries/validation/pool-validation'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'

const getPoolTvlFromLib = async ({ poolAddress }: Pick<PoolQuery, 'poolAddress'>) =>
  (await requireLib('curveApi').getPool(poolAddress).stats.totalLiquidity()) as Decimal

const { useQuery: usePoolTvlQuery } = queryFactory({
  category: 'dex.pools',
  queryKey: ({ chainId, poolAddress }: PoolParams) => ({ name: 'stats.tvl', chainId, poolAddress }) as const,
  queryFn: async ({ poolAddress }: PoolQuery) => await getPoolTvlFromLib({ poolAddress }),
  validationSuite: curvePoolValidationSuite,
})

export const usePoolTvl = (params: PoolParams) => useHydratedQuery(usePoolTvlQuery, params)
