import { USE_API } from '@/llamalend/queries/market/market.constants'
import { notFalsy } from '@primitives/objects.utils'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { isLLv2Enabled } from '@ui-kit/hooks/useFeatureFlags'
import { ChainParams, type ChainQuery, queryFactory, rootKeys } from '@ui-kit/lib/model/query'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'
import { Chain } from '@ui-kit/utils'

const V1 = 'v1' as const
const V2 = 'v2' as const

const v2chains = [Chain.Optimism]

export const { useQuery: useOneWayMarketNames, prefetchQuery: prefetchMarkets } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => [...rootKeys.chain({ chainId }), 'lendMarkets.getMarketList'] as const,
  queryFn: async ({ chainId }: ChainQuery): Promise<string[]> => {
    const api = requireLib('llamaApi')
    await Promise.all(
      notFalsy(V1, isLLv2Enabled() && v2chains.includes(chainId) && V2).map((version) =>
        api.lendMarkets.fetchMarkets({ useApi: USE_API, version }),
      ),
    )
    return api.lendMarkets.getMarketList()
  },
  validationSuite: llamaApiValidationSuite,
  category: 'llamalend.marketList',
})
