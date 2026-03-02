import type { PoolTemplate } from '@curvefi/api/lib/pools'
import type { Address } from '@primitives/address.utils'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { queryFactory, rootKeys, type UserPoolParams, type UserPoolQuery } from '@ui-kit/lib/model'
import { userPoolValidationSuite } from '@ui-kit/lib/model/query/user-pool-validation'
import { Chain } from '@ui-kit/utils'
import { isValidAddress } from '../utils'

export async function userPoolBoost(chainId: number, pool: PoolTemplate, userAddress: Address) {
  if (chainId !== Chain.Ethereum || !isValidAddress(pool.gauge.address)) return ''
  const result = await pool.userBoost(userAddress)
  return result === 'NaN' ? '0' : result
}

export const { useQuery: useUserPoolBoostQuery, invalidate: invalidateUserPoolBoostQuery } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress }: UserPoolParams) =>
    [...rootKeys.userPool({ chainId, poolId, userAddress }), 'userBoost'] as const,
  category: 'dex.user',
  queryFn: async ({ chainId, poolId, userAddress }: UserPoolQuery) =>
    userPoolBoost(chainId, requireLib('curveApi').getPool(poolId), userAddress),
  validationSuite: userPoolValidationSuite,
})
