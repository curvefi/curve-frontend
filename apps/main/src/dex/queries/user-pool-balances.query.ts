import { requireLib } from '@evm-ui/features/connect-wallet'
import { rootKeys, type UserPoolParams, type UserPoolQuery } from '@evm-ui/lib/model'
import { userPoolValidationSuite } from '@evm-ui/lib/model/query/user-pool-validation'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useUserPoolBalancesQuery, invalidate: invalidateUserPoolBalancesQuery } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress }: UserPoolParams) =>
    [...rootKeys.userPool({ chainId, poolId, userAddress }), 'userBalances'] as const,
  category: 'dex.user',
  queryFn: async ({ poolId, userAddress }: UserPoolQuery) =>
    requireLib('curveApi').getPool(poolId).userBalances(userAddress),
  validationSuite: userPoolValidationSuite,
})
