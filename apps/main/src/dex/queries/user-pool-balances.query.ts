import { requireLib } from '@evm-ui/features/connect-wallet'
import type { UserPoolParams, UserPoolQuery } from '@evm-ui/queries/query-types'
import { userPoolValidationSuite } from '@evm-ui/queries/validation/user-pool-validation'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useUserPoolBalancesQuery, invalidate: invalidateUserPoolBalancesQuery } = queryFactory({
  queryKey: ({ chainId, poolAddress, userAddress }: UserPoolParams) =>
    ({ name: 'userBalances', chainId, poolAddress, userAddress }) as const,
  category: 'dex.user',
  queryFn: async ({ poolAddress, userAddress }: UserPoolQuery) =>
    (await requireLib('curveApi').getPool(poolAddress).userBalances(userAddress)) as Decimal[],
  validationSuite: userPoolValidationSuite,
})
