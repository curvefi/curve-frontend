import { requireLib } from '@evm-ui/features/connect-wallet'
import { hydratedQueryFactory } from '@evm-ui/hooks/useHydratedQuery'
import type { PoolParams, PoolQuery } from '@evm-ui/queries/query-types'
import { curvePoolValidationSuite } from '@evm-ui/queries/validation/pool-validation'
import type { Decimal } from '@primitives/decimal.utils'

const getPoolTvlFromLib = async ({ poolAddress }: Pick<PoolQuery, 'poolAddress'>) =>
  (await requireLib('curveApi').getPool(poolAddress).stats.totalLiquidity()) as Decimal

export const { useQuery: usePoolTvl } = hydratedQueryFactory({
  category: 'dex.pools',
  queryKey: ({ chainId, poolAddress }: PoolParams) => ({ name: 'stats.tvl', chainId, poolAddress }) as const,
  queryFn: async ({ poolAddress }: PoolQuery) => await getPoolTvlFromLib({ poolAddress }),
  validationSuite: curvePoolValidationSuite,
})
