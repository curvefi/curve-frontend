import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { hydratedQueryFactory } from '@evm-ui/hooks/useHydratedQuery'
import type { UserPoolParams, UserPoolQuery } from '@evm-ui/queries/query-types'
import { userPoolValidationSuite } from '@evm-ui/queries/validation/user-pool-validation'
import { isValidAddress } from '@evm-ui/utils'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { Chain } from '@primitives/network.utils'
import { decimal } from '@ui/lib/decimal'

const ETH: number = Chain.Ethereum

const userPoolBoost = async (chainId: number, pool: PoolTemplate, userAddress: Address): Promise<Decimal | null> =>
  chainId === ETH && isValidAddress(pool.gauge.address) ? (decimal(await pool.userBoost(userAddress)) ?? null) : null

export const { useQuery: useUserPoolBoostQuery, invalidate: invalidateUserPoolBoostQuery } = hydratedQueryFactory({
  queryKey: ({ chainId, poolAddress, userAddress }: UserPoolParams) =>
    ({ name: 'userBoost', chainId, poolAddress, userAddress }) as const,
  category: 'dex.user',
  queryFn: async ({ chainId, poolAddress, userAddress }: UserPoolQuery) =>
    await userPoolBoost(chainId, requireLib('curveApi').getPool(poolAddress), userAddress),
  validationSuite: userPoolValidationSuite,
})
