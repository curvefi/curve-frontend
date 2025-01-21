import { apiValidationGroup, chainValidationGroup } from './validation'
import { ChainParams, ChainQuery, queryFactory } from '@ui-kit/lib/model/query'
import useStore from '@lend/store/useStore'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { ChainId } from '@lend/types/lend.types'

export const { useQuery: useOneWayMarketNames, prefetchQuery: prefetchMarkets } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => ['chain', { chainId }, 'markets'] as const,
  queryFn: async (_: ChainQuery<ChainId>): Promise<string[]> => {
    const api = useStore.getState().api!
    await api.oneWayfactory.fetchMarkets()
    return api.oneWayfactory.getMarketList()
  },
  staleTime: '5m',
  refetchInterval: '1m',
  validationSuite: createValidationSuite((params: ChainParams<ChainId>) => {
    chainValidationGroup(params)
    apiValidationGroup(params)
  }),
})
