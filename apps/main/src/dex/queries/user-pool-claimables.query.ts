import { groupBy } from 'lodash'
import { useMemo } from 'react'
import { requireLib, useCurve } from '@evm-ui/features/connect-wallet'
import type { UserChainParams, UserChainQuery } from '@evm-ui/queries/query-types'
import { chainValidationGroup } from '@evm-ui/queries/validation/chain-validation'
import { userAddressValidationGroup } from '@evm-ui/queries/validation/evm-address-validation'
import type { Address } from '@primitives/address.utils'
import { Chain } from '@primitives/network.utils'
import { assert, fromEntries, recordEntries } from '@primitives/objects.utils'
import { NoRetryError, queryFactory } from '@ui/features/queries/factory'
import { q, type QueryData } from '@ui/features/queries/util'
import { decimal, decimalMultiply, decimalSum } from '@ui/lib/decimal'
import { createValidationSuite } from '@ui/lib/validation/lib'
import type { FieldsOf } from '@ui/lib/validation/types'

type UserPoolClaimablesQuery = UserChainQuery<Chain> & { poolAddresses: Address[] }
type UserPoolClaimablesParams = FieldsOf<UserPoolClaimablesQuery>

// Temporary (?) workaround: these pools have broken behavior that breaks multicall
const CLAIMABLES_BLACKLIST: Partial<Record<Chain, Set<Address>>> = {
  [Chain.Ethereum]: new Set([
    // REUSD/3Crv: reward token 0xdBd34485773B0C9aDAC1B61b64e7c59049EB0944 reverts on symbol() and decimals().
    '0xC61557C5d177bd7DC889A3b621eEC333e168f68A',
  ]),
  [Chain.Polygon]: new Set([
    '0x2FB12dA70a17802200A512DE31dc0B1b2Da03b4c', // CRV2USD
    '0x82489c785f8edE332C8f08faD841f58e35FF201F', // UUS
  ]),
  [Chain.Arbitrum]: new Set(['0xd7bB79aeE866672419999a0496D99c54741D67B5']), // REUSD/2CRV
}

// Use this key to invalidate all user rewards regardless of the pools fetched.
export const getUserPoolClaimablesQueryKey = ({ chainId, userAddress }: UserChainParams) =>
  ({ name: 'userPoolClaimables', chainId, userAddress }) as const

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
  queryKey: ({ chainId, userAddress, poolAddresses }: UserPoolClaimablesParams) =>
    ({ ...getUserPoolClaimablesQueryKey({ chainId, userAddress }), poolAddresses }) as const,
  queryFn: async ({ userAddress, poolAddresses }: UserPoolClaimablesQuery) => {
    const curve = requireLib('curveApi')

    // This is a very heavy function call, so we want to avoid many retries.
    const poolRewards = await curve.getUserClaimable(poolAddresses, userAddress).catch(error => {
      throw new NoRetryError(error instanceof Error ? error.message : 'Failed to fetch user claimables')
    })

    return fromEntries(
      poolAddresses.map((poolAddress, index) =>
        // Curve can return CRV emissions and extra CRV rewards separately for the same token.
        [
          poolAddress,
          recordEntries(
            groupBy(
              poolRewards[index].map(reward => ({
                ...reward,
                amount: assert(decimal(reward.amount), 'Invalid claimable amount'),
              })),
              reward => reward.token,
            ),
          ).map(([token, rewards]) => ({
            token,
            symbol: rewards[0]?.symbol,
            price: rewards[0]?.price,
            amount: decimalSum(...rewards.map(reward => reward.amount)),
            amountUsd: decimalSum(...rewards.map(reward => decimalMultiply(reward.amount, reward.price))),
          })),
        ],
      ),
    )
  },
  validationSuite: createValidationSuite((params: UserPoolClaimablesParams) => {
    chainValidationGroup(params)
    userAddressValidationGroup(params)
  }),
  category: 'dex.claims',
})

export function useUserPoolClaimables(params: UserPoolClaimablesParams, enabled = true) {
  const { curveApi, isHydrated } = useCurve()
  const { chainId, poolAddresses } = params
  const filteredPoolAddresses = useMemo(
    () => poolAddresses?.filter(address => chainId && !CLAIMABLES_BLACKLIST[chainId]?.has(address)),
    [chainId, poolAddresses],
  )
  const query = useUserPoolClaimablesQuery(
    { ...params, poolAddresses: filteredPoolAddresses },
    enabled && !!filteredPoolAddresses?.length && isHydrated && curveApi?.chainId === chainId,
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
