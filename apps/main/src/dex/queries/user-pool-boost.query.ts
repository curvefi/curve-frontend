import { requireLib, useCurve } from '@evm-ui/features/connect-wallet'
import { hydratedQueryFactory } from '@evm-ui/hooks/useHydratedQuery'
import type { UserChainParams, UserPoolParams, UserPoolQuery } from '@evm-ui/queries/query-types'
import { userPoolValidationSuite } from '@evm-ui/queries/validation/user-pool-validation'
import { isValidAddress } from '@evm-ui/utils'
import type { Address } from '@primitives/address.utils'
import { Chain } from '@primitives/network.utils'
import { combineQueriesToObject } from '@ui/features/queries/combine'
import { queryClient } from '@ui/features/queries/query-client'
import { useQueries } from '@ui/features/queries/query-hooks'
import { decimal } from '@ui/lib/decimal'

const NAME = 'userBoost'

const {
  useQuery: useUserPoolBoostQuery,
  invalidate: invalidateUserPoolBoostQuery,
  getQueryOptions: getUserPoolBoostQueryOptions,
} = hydratedQueryFactory({
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

export { useUserPoolBoostQuery, invalidateUserPoolBoostQuery }

/** Reset boosts for all pools belonging to this chain and user. */
export const resetUserPoolBoostQuery = ({ chainId, userAddress }: UserChainParams) =>
  queryClient.resetQueries({ queryKey: [{ name: NAME, chainId, userAddress }] })

export const useUserPoolBoosts = (
  { chainId, userAddress, poolAddresses = [] }: UserChainParams & { poolAddresses?: Address[] },
  enabled = true,
) => {
  const { isHydrated } = useCurve()
  const isEnabled = enabled && isHydrated && chainId === Number(Chain.Ethereum)

  return useQueries({
    queries: poolAddresses.map(poolAddress =>
      getUserPoolBoostQueryOptions({ chainId, userAddress, poolAddress }, isEnabled),
    ),
    combine: results =>
      combineQueriesToObject(
        // Raw query options bypass useHydratedQuery, and isLoading for disabled queries is false. Show loading skeleton while Curve hydrates.
        results.map(({ data, error, isLoading }) => ({ data, error, isLoading: isLoading || !isHydrated })),
        poolAddresses,
      ),
  })
}
