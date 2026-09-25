import { groupBy } from 'lodash'
import { useCallback } from 'react'
import type { ClaimableReward } from '@/dex/types/main.types'
import { requireLib, useCurve } from '@evm-ui/features/connect-wallet'
import { rootKeys, type UserChainParams, type UserChainQuery } from '@evm-ui/queries/root-keys'
import { chainValidationGroup } from '@evm-ui/queries/validation/chain-validation'
import { userAddressValidationGroup } from '@evm-ui/queries/validation/evm-address-validation'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { fromEntries } from '@primitives/objects.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { q, useMappedQuery, type QueryData } from '@ui/features/queries/util'
import { decimal, decimalMultiply, decimalSum } from '@ui/lib/decimal'
import { createValidationSuite } from '@ui/lib/validation/lib'
import type { FieldsOf } from '@ui/lib/validation/types'
import type { useUserPoolPositions } from './user-pool-positions.query'

export type PoolClaimables = (ClaimableReward & { amountUsd: Decimal })[]

type UserPoolClaimablesQuery = UserChainQuery & { poolAddresses: Address[] }
type UserPoolClaimablesParams = FieldsOf<UserPoolClaimablesQuery>

// Use this key to invalidate all user rewards regardless of the pools fetched.
export const getUserPoolClaimablesQueryKey = (params: UserChainParams) =>
  [...rootKeys.userChain(params), 'userPoolClaimables'] as const

/**
 * Including pool addresses in the query key makes refetching straightforward, but a position
 * change can refetch all pools. Per-pool queries would avoid this but lose multicall batching.
 *
 * We could batch-prefetch and manually populate each pool's TanStack Query cache, as in
 * prefetchTokenBalances. However, likely >90% of users have fewer than 10 active positions,
 * so the expected gains don't justify the extra work and complexity. Keep one multicall batch.
 *
 */
const { useQuery: useUserPoolClaimablesQuery } = queryFactory({
  queryKey: (params: UserPoolClaimablesParams) =>
    [...getUserPoolClaimablesQueryKey(params), { poolAddresses: params.poolAddresses }] as const,
  queryFn: async ({ userAddress, poolAddresses }: UserPoolClaimablesQuery) => {
    const curve = requireLib('curveApi')
    const poolRewards = await curve.getUserClaimable(poolAddresses, userAddress)

    return fromEntries(
      poolAddresses.map((poolAddress, index) => {
        // Curve can return CRV emissions and extra CRV rewards separately for the same token.
        const claimables = Object.entries(groupBy(poolRewards[index], reward => reward.token)).map(
          ([token, rewards]) => {
            const [{ symbol, price }] = rewards
            return {
              token,
              symbol,
              price,
              amount: decimalSum(...rewards.map(reward => decimal(reward.amount))),
              amountUsd: decimalSum(
                ...rewards.map(reward => decimalMultiply(decimal(reward.amount) ?? '0', reward.price)),
              ),
            }
          },
        )

        return [poolAddress, claimables]
      }),
    )
  },
  validationSuite: createValidationSuite((params: UserPoolClaimablesParams) => {
    chainValidationGroup(params)
    userAddressValidationGroup(params)
  }),
  category: 'dex.claims',
})

export function useUserPoolClaimables(params: UserChainParams, positions: ReturnType<typeof useUserPoolPositions>) {
  const { curveApi, isHydrated } = useCurve()
  const poolAddresses = useMappedQuery(
    positions,
    useCallback(({ positions }) => [...new Set(positions.map(({ address }) => address))], []),
  )

  const query = useUserPoolClaimablesQuery(
    { ...params, poolAddresses: poolAddresses.data },
    (poolAddresses.data?.length ?? 0) > 0 && isHydrated && curveApi?.chainId === params.chainId,
  )

  return {
    ...q(query),
    // We need to expand QueryProp some time, because we only expose isLoading even though we sometimes want isFetching or isPending
    // In this case we want isPending as we want a skeleton during the initial load, but no skeleton during refreshing stale data.
    isLoading: query.isPending,
    isFetching: query.isFetching,
  }
}

export type UserPoolClaimables = QueryData<typeof useUserPoolClaimables>
