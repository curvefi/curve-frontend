import { requireLib } from '@evm-ui/features/connect-wallet'
import { hydratedQueryFactory } from '@evm-ui/hooks/useHydratedQuery'
import type { UserPoolParams, UserPoolQuery } from '@evm-ui/queries/query-types'
import { userPoolValidationSuite } from '@evm-ui/queries/validation/user-pool-validation'

export const { useQuery: useUserPoolShareQuery, invalidate: invalidateUserPoolShareQuery } = hydratedQueryFactory({
  queryKey: ({ chainId, poolAddress, userAddress }: UserPoolParams) =>
    ({ name: 'userShare', chainId, poolAddress, userAddress }) as const,
  category: 'dex.user',
  queryFn: async ({ poolAddress, userAddress }: UserPoolQuery) =>
    requireLib('curveApi').getPool(poolAddress).userShare(userAddress),
  validationSuite: userPoolValidationSuite,
})
