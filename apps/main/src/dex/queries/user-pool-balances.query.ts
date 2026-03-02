import { requireLib } from '@ui-kit/features/connect-wallet'
import { queryFactory, rootKeys, type UserPoolParams, type UserPoolQuery } from '@ui-kit/lib/model'
import { userPoolValidationSuite } from '@ui-kit/lib/model/query/user-pool-validation'

export const { useQuery: useUserPoolBalancesQuery, invalidate: invalidateUserPoolBalancesQuery } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress }: UserPoolParams) =>
    [...rootKeys.userPool({ chainId, poolId, userAddress }), 'userBalances'] as const,
  category: 'dex.user',
  queryFn: async ({ poolId, userAddress }: UserPoolQuery) =>
    requireLib('curveApi').getPool(poolId).userBalances(userAddress),
  validationSuite: userPoolValidationSuite,
})
