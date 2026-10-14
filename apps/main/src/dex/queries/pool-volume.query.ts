import { requireLib } from '@evm-ui/features/connect-wallet'
import { isLiteChain } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import { useHydratedQuery } from '@evm-ui/hooks/useHydratedQuery'
import type { PoolParams, PoolQuery } from '@evm-ui/queries/query-types'
import { curvePoolValidationSuite } from '@evm-ui/queries/validation/pool-validation'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'

const { useQuery: usePoolVolumeQuery } = queryFactory({
  category: 'dex.pools',
  queryKey: ({ chainId, poolId }: PoolParams) => ({ name: 'stats.volume', chainId, poolId }) as const,
  queryFn: async ({ poolId }: PoolQuery) => (await requireLib('curveApi').getPool(poolId).stats.volume()) as Decimal,
  validationSuite: curvePoolValidationSuite,
})

export const usePoolVolume = (params: PoolParams) =>
  useHydratedQuery(usePoolVolumeQuery, params, params.chainId != null && !isLiteChain(params.chainId))
