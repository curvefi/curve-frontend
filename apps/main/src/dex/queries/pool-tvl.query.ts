import { requireLib, useCurve } from '@evm-ui/features/connect-wallet'
import { rootKeys, type PoolParams, type PoolQuery } from '@evm-ui/queries/root-keys'
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
  queryKey: ({ chainId, poolId }: PoolParams) => [rootKeys.pool({ chainId, poolId }), { name: 'stats.tvl' }] as const,
  queryFn: async ({ poolId }: PoolQuery) => await getPoolTvlFromLib({ poolId }),
  validationSuite: createValidationSuite((params: PoolParams) => {
    curveApiValidationGroup(params)
    chainValidationGroup(params)
    poolValidationGroup(params)
  }),
})

/** Hook to fetch the TVL for a single pool. */
export function usePoolTvl({ chainId, poolId }: PoolParams) {
  const { isHydrated } = useCurve()
  return usePoolTvlQuery({ chainId, poolId }, isHydrated)
}
