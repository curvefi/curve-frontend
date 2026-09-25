import { requireLib } from '@evm-ui/features/connect-wallet'
import { rootKeys, type UserPoolParams, type UserPoolQuery } from '@evm-ui/queries/root-keys'
import { userPoolValidationSuite } from '@evm-ui/queries/validation/user-pool-validation'
import { queryFactory } from '@ui/features/queries/factory'
import { decimal } from '@ui/lib/decimal'

export const { useQuery: useUserPoolLiquidityUsdQuery, invalidate: invalidateUserPoolLiquidityUsdQuery } = queryFactory(
  {
    queryKey: ({ chainId, poolId, userAddress }: UserPoolParams) =>
      [rootKeys.userPool({ chainId, poolId, userAddress }), { name: 'userLiquidityUSD' }] as const,
    category: 'dex.user',
    queryFn: async ({ poolId, userAddress }: UserPoolQuery) =>
      requireLib('curveApi')
        .getPool(poolId)
        .userLiquidityUSD(userAddress)
        .catch(() => 'NaN') // todo: remove, this is gross
        .then(x => decimal(x) ?? null),
    validationSuite: userPoolValidationSuite,
  },
)
