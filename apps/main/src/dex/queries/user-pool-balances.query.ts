import { requireLib } from '@evm-ui/features/connect-wallet'
import type { UserPoolParams, UserPoolQuery } from '@evm-ui/queries/query-types'
import { userPoolValidationSuite } from '@evm-ui/queries/validation/user-pool-validation'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useUserPoolBalancesQuery, invalidate: invalidateUserPoolBalancesQuery } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress }: UserPoolParams) =>
    ({ name: 'userBalances', chainId, poolId, userAddress }) as const,
  category: 'dex.user',
  queryFn: async ({ poolId, userAddress }: UserPoolQuery) =>
    (await requireLib('curveApi').getPool(poolId).userBalances(userAddress)) as Decimal[],
  validationSuite: userPoolValidationSuite,
})
