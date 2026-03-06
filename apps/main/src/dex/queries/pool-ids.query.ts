import { requireLib } from '@ui-kit/features/connect-wallet'
import { log } from '@ui-kit/lib/logging'
import { queryFactory, rootKeys, type ChainQuery, type ChainParams } from '@ui-kit/lib/model'
import { curveApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'
import { getNetworks, networksQueryKey } from '../entities/networks'

/**
 * Gets a list of all pool ids as it hydrates curve-js as well.
 *
 * @remarks
 * The pool ids returned by this query are not yet blacklisted,
 * as that requires additional logic based on pool addresses. In addition,
 * this query also hydrates curve-js, so we want to keep it as simple as possible.
 *
 * The interpolated variables (`useApi`, `hasRpc`) were once part of the query key,
 * but have been removed so that the query depends solely on `chainId`. This is because:
 *
 * - We use a singleton for the curve lib, so the passed parameter values may not be
 *   in sync with the final API instance retrieved by {@link requireLib}.
 * - Whatever `requireLib` returns is now deemed the source of truth.
 * - Any query that depends on pool ids would also need to include the same interpolated
 *   values in its own query key, which would unnecessarily complicate things.
 */
export const {
  useQuery: usePoolIds,
  refetchQuery: refetchPoolIds,
  getQueryData: getPoolIds,
  queryKey: poolIdsQueryKey,
} = queryFactory({
  queryKey: ({ chainId }: ChainParams) => [...rootKeys.chain({ chainId }), 'getPoolList'] as const,
  queryFn: async ({ chainId }: ChainQuery) => {
    // must call api in this order, must use api to get non-cached version of gaugeStatus
    const curve = requireLib('curveApi')
    const { useApi } = getNetworks()[chainId]

    log(`Hydrating DEX - Fetching pool ids { useApi: ${useApi}, hasRpc: ${!curve.isNoRPC} }`)

    await Promise.all([
      curve.factory.fetchPools(useApi),
      curve.cryptoFactory.fetchPools(useApi),
      curve.twocryptoFactory.fetchPools(useApi),
      curve.crvUSDFactory.fetchPools(useApi),
      curve.tricryptoFactory.fetchPools(useApi),
      curve.stableNgFactory.fetchPools(useApi),
    ])

    if (!curve.isNoRPC) {
      await Promise.all([
        curve.factory.fetchNewPools(),
        curve.cryptoFactory.fetchNewPools(),
        curve.twocryptoFactory.fetchNewPools(),
        curve.tricryptoFactory.fetchNewPools(),
        curve.stableNgFactory.fetchNewPools(),
      ])
    }

    return curve.getPoolList()
  },
  category: 'dex.pools',
  validationSuite: curveApiValidationSuite,
  dependencies: () => [networksQueryKey()],
})
