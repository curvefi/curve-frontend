import { requireLib } from '@evm-ui/features/connect-wallet'
import { hydratedQueryFactory } from '@evm-ui/hooks/useHydratedQuery'
import type { UserPoolParams, UserPoolQuery } from '@evm-ui/queries/query-types'
import { userPoolValidationSuite } from '@evm-ui/queries/validation/user-pool-validation'
import { decimal } from '@ui/lib/decimal'

export const { useQuery: useUserPoolLiquidityUsdQuery, invalidate: invalidateUserPoolLiquidityUsdQuery } =
  hydratedQueryFactory({
    queryKey: ({ chainId, poolAddress, userAddress }: UserPoolParams) =>
      ({ name: 'userLiquidityUSD', chainId, poolAddress, userAddress }) as const,
    category: 'dex.user',
    queryFn: async ({ poolAddress, userAddress }: UserPoolQuery) =>
      requireLib('curveApi')
        .getPool(poolAddress)
        .userLiquidityUSD(userAddress)
        .catch(() => 'NaN') // todo: remove, this is gross
        .then(x => decimal(x) ?? null),
    validationSuite: userPoolValidationSuite,
  })
