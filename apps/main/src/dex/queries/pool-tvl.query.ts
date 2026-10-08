import { requireLib } from '@evm-ui/features/connect-wallet'
import { useHydratedQuery } from '@evm-ui/hooks/useHydratedQuery'
import type { PoolParams, PoolQuery } from '@evm-ui/queries/query-types'
import { curvePoolValidationSuite } from '@evm-ui/queries/validation/pool-validation'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'

const getPoolTvlFromLib = async ({ poolId }: Pick<PoolQuery, 'poolId'>) =>
  (await requireLib('curveApi').getPool(poolId).stats.totalLiquidity()) as Decimal

const { useQuery: usePoolTvlQuery } = queryFactory({
  category: 'dex.pools',
  queryKey: ({ chainId, poolId }: PoolParams) => ({ name: 'stats.tvl', chainId, poolId }) as const,
  queryFn: async ({ poolId }: PoolQuery) => await getPoolTvlFromLib({ poolId }),
  validationSuite: curvePoolValidationSuite,
})

export const usePoolTvl = (params: PoolParams) => useHydratedQuery(usePoolTvlQuery, params)
