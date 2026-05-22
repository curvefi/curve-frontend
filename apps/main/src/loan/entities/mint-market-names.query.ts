import { USE_API } from '@/llamalend/queries/market/market.constants'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { ChainParams, queryFactory, rootKeys } from '@ui-kit/lib/model/query'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'

export const {
  useQuery: useMintMarketNames,
  reset: resetMintMarkets,
  prefetchQuery: prefetchMintMarkets,
} = queryFactory({
  queryKey: ({ chainId }: ChainParams) => [...rootKeys.chain({ chainId }), 'mintMarkets.getMarketList'] as const,
  queryFn: async (): Promise<string[]> => {
    const api = requireLib('llamaApi')
    await api.mintMarkets.fetchMintMarkets({ useApi: USE_API })
    return api.mintMarkets.getMarketList()
  },
  validationSuite: llamaApiValidationSuite,
  category: 'llamalend.marketList',
})
