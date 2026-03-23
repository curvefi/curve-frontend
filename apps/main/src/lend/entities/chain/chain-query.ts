import { USE_API } from '@/llamalend/queries/market/market.constants'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { ChainParams, queryFactory, rootKeys } from '@ui-kit/lib/model/query'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'

export const { useQuery: useOneWayMarketNames, prefetchQuery: prefetchMarkets } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => [...rootKeys.chain({ chainId }), 'lendMarkets.getMarketList'] as const,
  queryFn: async (): Promise<string[]> => {
    const api = requireLib('llamaApi')
    await api.lendMarkets.fetchMarkets({ useApi: USE_API, version: 'v1' })
    return api.lendMarkets.getMarketList()
  },
  validationSuite: llamaApiValidationSuite,
  category: 'llamalend.marketList',
})
