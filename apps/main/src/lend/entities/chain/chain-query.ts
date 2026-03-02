import { ChainId } from '@/lend/types/lend.types'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { ChainParams, ChainQuery, queryFactory } from '@ui-kit/lib/model/query'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'

export const { useQuery: useOneWayMarketNames, prefetchQuery: prefetchMarkets } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => ['chain', { chainId }, 'markets'] as const,
  queryFn: async ({ chainId }: ChainQuery<ChainId>): Promise<string[]> => {
    const useAPI = chainId !== 146 // disable API for sonic
    const api = requireLib('llamaApi')
    await api.lendMarkets.fetchMarkets(useAPI)
    return api.lendMarkets.getMarketList()
  },
  validationSuite: llamaApiValidationSuite,
  category: 'llamalend.marketList',
})
