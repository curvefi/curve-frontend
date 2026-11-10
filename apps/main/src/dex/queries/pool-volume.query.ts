import { requireLib } from '@evm-ui/features/connect-wallet'
import { isLiteChain } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import { hydratedQueryFactory } from '@evm-ui/hooks/useHydratedQuery'
import type { PoolParams, PoolQuery } from '@evm-ui/queries/query-types'
import { curvePoolValidationSuite } from '@evm-ui/queries/validation/pool-validation'
import type { Decimal } from '@primitives/decimal.utils'

const { useQuery: usePoolVolumeQuery } = hydratedQueryFactory({
  category: 'dex.pools',
  queryKey: ({ chainId, poolAddress }: PoolParams) => ({ name: 'stats.volume', chainId, poolAddress }) as const,
  queryFn: async ({ poolAddress }: PoolQuery) =>
    (await requireLib('curveApi').getPool(poolAddress).stats.volume()) as Decimal,
  validationSuite: curvePoolValidationSuite,
})

export const usePoolVolume = (params: PoolParams) =>
  usePoolVolumeQuery(params, params.chainId != null && !isLiteChain(params.chainId))
