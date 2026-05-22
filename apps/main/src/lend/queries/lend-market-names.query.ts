import { requireLib } from 'curve-ui-kit/src/features/connect-wallet'
import { ChainParams, type ChainQuery, queryFactory, rootKeys } from 'curve-ui-kit/src/lib/model/query'
import { llamaApiValidationSuite } from 'curve-ui-kit/src/lib/model/query/curve-api-validation'
import { Chain } from 'curve-ui-kit/src/utils'
import { USE_API } from '@/llamalend/queries/market/market.constants'
import { notFalsy } from '@curvefi/primitives/objects.utils'

const V1 = 'v1' as const
const V2 = 'v2' as const

const v2chains = [Chain.Optimism]

export const {
  useQuery: useLendMarketNames,
  reset: resetLendMarkets,
  prefetchQuery: prefetchLendMarkets,
} = queryFactory({
  queryKey: ({ chainId, enableLLv2 }: ChainParams & { enableLLv2: boolean }) =>
    [...rootKeys.chain({ chainId }), 'lendMarkets.getMarketList', { enableLLv2 }] as const,
  queryFn: async ({ chainId, enableLLv2 }: ChainQuery & { enableLLv2: boolean }): Promise<string[]> => {
    const api = requireLib('llamaApi')
    await Promise.all(
      notFalsy(V1, enableLLv2 && v2chains.includes(chainId) && V2).map(version =>
        api.lendMarkets.fetchMarkets({ useApi: USE_API, version }),
      ),
    )
    return api.lendMarkets.getMarketList()
  },
  validationSuite: llamaApiValidationSuite,
  category: 'llamalend.marketList',
})
