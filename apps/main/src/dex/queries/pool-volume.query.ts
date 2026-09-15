import { requireLib, useCurve } from '@evm-ui/features/connect-wallet'
import { isLiteChain } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import { type PoolParams, type PoolQuery, rootKeys } from '@evm-ui/lib/model'
import { chainValidationGroup } from '@evm-ui/lib/model/query/chain-validation'
import { curveApiValidationGroup } from '@evm-ui/lib/model/query/curve-api-validation'
import { poolValidationGroup } from '@evm-ui/lib/model/query/pool-validation'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { createValidationSuite } from '@ui/lib/validation/lib'

const { useQuery: usePoolVolumeQuery } = queryFactory({
  category: 'dex.pools',
  queryKey: ({ chainId, poolId }: PoolParams) => [...rootKeys.pool({ chainId, poolId }), 'stats.volume'] as const,
  queryFn: async ({ poolId }: PoolQuery) => (await requireLib('curveApi').getPool(poolId).stats.volume()) as Decimal,
  validationSuite: createValidationSuite((params: PoolParams) => {
    curveApiValidationGroup(params)
    chainValidationGroup(params)
    poolValidationGroup(params)
  }),
})

/** Hook to fetch the trading volume for a single pool. Disabled on lite networks. */
export function usePoolVolume({ chainId, poolId }: PoolParams) {
  const { isHydrated } = useCurve()
  return usePoolVolumeQuery({ chainId, poolId }, isHydrated && chainId != null && !isLiteChain(chainId))
}
