import type { PoolTemplate } from '@curvefi/api/lib/pools'
import type { Address } from '@primitives/address.utils'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { queryFactory, rootKeys, type UserPoolParams, type UserPoolQuery } from '@ui-kit/lib/model'
import { userPoolValidationSuite } from '@ui-kit/lib/model/query/user-pool-validation'
import { isValidAddress } from '../utils'

export async function userPoolRewardCrvApy(pool: PoolTemplate, userAddress: Address) {
  if (!isValidAddress(pool.gauge.address) || pool.rewardsOnly()) return 0
  const result = await pool.userCrvApy(userAddress)
  return String(result) === 'NaN' ? 0 : result
}

export const { useQuery: useUserPoolRewardCrvApyQuery, invalidate: invalidateUserPoolRewardCrvApyQuery } = queryFactory(
  {
    queryKey: ({ chainId, poolId, userAddress }: UserPoolParams) =>
      [...rootKeys.userPool({ chainId, poolId, userAddress }), 'reward-crv-apy'] as const,
    category: 'dex.user',
    queryFn: async ({ poolId, userAddress }: UserPoolQuery) =>
      userPoolRewardCrvApy(requireLib('curveApi').getPool(poolId), userAddress),
    validationSuite: userPoolValidationSuite,
  },
)
