import { requireLib } from '@evm-ui/features/connect-wallet'
import { useHydratedQuery } from '@evm-ui/hooks/useHydratedQuery'
import type { PoolParams, PoolQuery } from '@evm-ui/queries/query-types'
import { chainValidationGroup } from '@evm-ui/queries/validation/chain-validation'
import { curveApiValidationGroup } from '@evm-ui/queries/validation/curve-api-validation'
import { poolValidationGroup } from '@evm-ui/queries/validation/pool-validation'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { createValidationSuite } from '@ui/lib/validation/lib'

const getPoolTvlFromLib = async ({ poolId }: Pick<PoolQuery, 'poolId'>) =>
  (await requireLib('curveApi').getPool(poolId).stats.totalLiquidity()) as Decimal

const { useQuery: usePoolTvlQuery } = queryFactory({
  category: 'dex.pools',
  queryKey: ({ chainId, poolId }: PoolParams) => ({ name: 'stats.tvl', chainId, poolId }) as const,
  queryFn: async ({ poolId }: PoolQuery) => await getPoolTvlFromLib({ poolId }),
  validationSuite: createValidationSuite((params: PoolParams) => {
    curveApiValidationGroup(params)
    chainValidationGroup(params)
    poolValidationGroup(params)
  }),
})

export const usePoolTvl = (params: PoolParams) => useHydratedQuery(usePoolTvlQuery, params)
