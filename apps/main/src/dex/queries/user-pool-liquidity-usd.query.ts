import { requireLib } from '@ui-kit/features/connect-wallet'
import { queryFactory, rootKeys, type UserPoolParams, type UserPoolQuery } from '@ui-kit/lib/model'
import { userPoolValidationSuite } from '@ui-kit/lib/model/query/user-pool-validation'
import { decimal } from '@ui-kit/utils'

export const { useQuery: useUserPoolLiquidityUsdQuery, invalidate: invalidateUserPoolLiquidityUsdQuery } = queryFactory(
  {
    queryKey: ({ chainId, poolId, userAddress }: UserPoolParams) =>
      [...rootKeys.userPool({ chainId, poolId, userAddress }), 'userLiquidityUSD'] as const,
    category: 'dex.user',
    queryFn: async ({ poolId, userAddress }: UserPoolQuery) =>
      requireLib('curveApi')
        .getPool(poolId)
        .userLiquidityUSD(userAddress)
        .catch(() => 'NaN') // todo: remove, this is gross
        .then((x) => decimal(x) ?? null),
    validationSuite: userPoolValidationSuite,
  },
)
