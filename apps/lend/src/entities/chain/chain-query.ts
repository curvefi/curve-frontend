import { chainValidationSuite } from './validation'
import { ChainParams, ChainQuery, queryFactory } from '@/shared/model/query'
import useStore from '@/store/useStore'

export const { useQuery: useOneWayMarketNames, prefetchQuery: prefetchMarkets } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => ['chain', { chainId }, 'markets'] as const,
  queryFn: async (_: ChainQuery<ChainId>): Promise<string[]> => {
    const api = useStore.getState().api!
    await api.oneWayfactory.fetchMarkets()
    return api.oneWayfactory.getMarketList()
  },
  staleTime: '5m',
  refetchInterval: '1m',
  validationSuite: chainValidationSuite,
})
