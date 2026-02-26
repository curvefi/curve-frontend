import { enforce, test } from 'vest'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { queryFactory, rootKeys, type ChainQuery } from '@ui-kit/lib/model'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { curveApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'

type PoolsQuery = ChainQuery & { useApi: boolean; hasRpc: boolean }
type PoolsParams = FieldsOf<PoolsQuery>

/**
 * Gets a list of all pool ids as it hydrates curve-js as well.
 *
 * @remarks The pool ids returned by this query are not yet blacklisted,
 * as that requires additional logic based on pool addresses. In addition,
 * this query also hydrates curve-js, so we want to keep it as simple as possible.
 */
export const { useQuery: usePoolIds, refetchQuery: fetchPoolIds } = queryFactory({
  queryKey: ({ chainId, useApi, hasRpc }: PoolsParams) =>
    [...rootKeys.chain({ chainId }), { useApi }, { hasRpc }, 'pool-ids'] as const,
  queryFn: async ({ useApi, hasRpc }: PoolsQuery) => {
    // must call api in this order, must use api to get non-cached version of gaugeStatus
    const curve = requireLib('curveApi')
    if (hasRpc != !curve.isNoRPC) throw new Error('RPC status mismatch between query params and curveApi')

    await Promise.all([
      curve.factory.fetchPools(useApi),
      curve.cryptoFactory.fetchPools(useApi),
      curve.twocryptoFactory.fetchPools(useApi),
      curve.crvUSDFactory.fetchPools(useApi),
      curve.tricryptoFactory.fetchPools(useApi),
      curve.stableNgFactory.fetchPools(useApi),
    ])

    if (hasRpc) {
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
  staleTime: '15m', // The list doesn't change often
  validationSuite: createValidationSuite((params: PoolsParams) => {
    chainValidationGroup(params)
    curveApiValidationGroup(params)

    test('useApi', 'useApi is required', () => {
      enforce(params.useApi).isNotUndefined()
    })

    test('hasRpc', 'hasRpc is required', () => {
      enforce(params.hasRpc).isNotUndefined()
    })
  }),
})
