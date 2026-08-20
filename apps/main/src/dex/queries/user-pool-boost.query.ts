import type { PoolTemplate } from '@curvefi/api/lib/pools'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { queryFactory, rootKeys, type UserPoolParams, type UserPoolQuery } from '@evm-ui/lib/model'
import { userPoolValidationSuite } from '@evm-ui/lib/model/query/user-pool-validation'
import { Chain, decimal } from '@evm-ui/utils'
import { isValidAddress } from '../utils'

const ETH: number = Chain.Ethereum

export const userPoolBoost = async (
  chainId: number,
  pool: PoolTemplate,
  userAddress: Address,
): Promise<Decimal | null> =>
  chainId === ETH && isValidAddress(pool.gauge.address) ? (decimal(await pool.userBoost(userAddress)) ?? null) : null

export const { useQuery: useUserPoolBoostQuery, invalidate: invalidateUserPoolBoostQuery } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress }: UserPoolParams) =>
    [...rootKeys.userPool({ chainId, poolId, userAddress }), 'userBoost'] as const,
  category: 'dex.user',
  queryFn: async ({ chainId, poolId, userAddress }: UserPoolQuery) =>
    await userPoolBoost(chainId, requireLib('curveApi').getPool(poolId), userAddress),
  validationSuite: userPoolValidationSuite,
})
