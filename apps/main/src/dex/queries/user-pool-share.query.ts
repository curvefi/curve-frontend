import { requireLib } from '@evm-ui/features/connect-wallet'
import { rootKeys, type UserPoolParams, type UserPoolQuery } from '@evm-ui/queries/root-keys'
import { userPoolValidationSuite } from '@evm-ui/queries/validation/user-pool-validation'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useUserPoolShareQuery, invalidate: invalidateUserPoolShareQuery } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress }: UserPoolParams) => ({
    name: 'userShare',
    ...rootKeys.userPool({ chainId, poolId, userAddress }),
  }),
  category: 'dex.user',
  queryFn: async ({ poolId, userAddress }: UserPoolQuery) =>
    requireLib('curveApi').getPool(poolId).userShare(userAddress),
  validationSuite: userPoolValidationSuite,
})
