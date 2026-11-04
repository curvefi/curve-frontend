import { test } from 'vest'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { hydratedQueryFactory } from '@evm-ui/hooks/useHydratedQuery'
import type { UserChainParams, UserChainQuery, UserPoolParams, UserPoolQuery } from '@evm-ui/queries/query-types'
import { curveApiWithWalletValidationSuite } from '@evm-ui/queries/validation/curve-api-validation'
import { userAddressValidationGroup } from '@evm-ui/queries/validation/evm-address-validation'
import { userPoolValidationSuite } from '@evm-ui/queries/validation/user-pool-validation'
import { isValidAddress } from '@evm-ui/utils'
import type { Address } from '@primitives/address.utils'
import { fromEntries } from '@primitives/objects.utils'
import { queryClient } from '@ui/features/queries/query-client'
import { decimal } from '@ui/lib/decimal'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import type { FieldsOf } from '@ui/lib/validation/types'

const NAME = 'userBoost'

export const { useQuery: useUserPoolBoostQuery } = hydratedQueryFactory({
  queryKey: ({ chainId, poolAddress, userAddress }: UserPoolParams) =>
    ({ name: NAME, chainId, poolAddress, userAddress }) as const,
  category: 'dex.user',
  queryFn: async ({ poolAddress, userAddress }: UserPoolQuery) => {
    const pool = requireLib('curveApi').getPool(poolAddress)
    return isValidAddress(pool.gauge.address) && !pool.rewardsOnly()
      ? (decimal(await pool.userBoost(userAddress)) ?? null)
      : null
  },
  validationSuite: userPoolValidationSuite,
})

/** Invalidate single-pool and batch boosts for this chain and user. */
export const invalidateUserPoolBoostQuery = ({ chainId, userAddress }: UserChainParams) =>
  queryClient.invalidateQueries({ queryKey: [{ name: NAME, chainId, userAddress }] })

/** Reset boosts for all pools belonging to this chain and user. */
export const resetUserPoolBoostQuery = ({ chainId, userAddress }: UserChainParams) =>
  queryClient.resetQueries({ queryKey: [{ name: NAME, chainId, userAddress }] })

type UserPoolBoostsQuery = UserChainQuery & { poolAddresses: Address[] }
type UserPoolBoostsParams = FieldsOf<UserPoolBoostsQuery>

export const { useQuery: useUserPoolBoosts } = hydratedQueryFactory({
  queryKey: ({ chainId, userAddress, poolAddresses }: UserPoolBoostsParams) =>
    ({ name: NAME, chainId, userAddress, poolAddresses: poolAddresses ?? [] }) as const,
  category: 'dex.user',
  queryFn: async ({ userAddress, poolAddresses }: UserPoolBoostsQuery) => {
    const boosts = await requireLib('curveApi').boosting.getUserBoosts(poolAddresses, userAddress, false)
    return fromEntries(poolAddresses.map(address => [address, decimal(boosts[address]) ?? null]))
  },
  validationSuite: createValidationSuite((params: UserPoolBoostsParams) => {
    curveApiWithWalletValidationSuite.run(params)
    userAddressValidationGroup(params)

    test('poolAddresses', 'Pool addresses must contain valid EVM addresses', () => {
      enforce(params.poolAddresses).isArray()
      params.poolAddresses?.forEach(address => enforce(address).isAddress())
    })
  }),
})
