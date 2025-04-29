import { ChainId } from '@/lend/types/lend.types'
import { ChainParams, ChainQuery, queryFactory } from '@ui-kit/lib/model/query'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { useApiStore } from '@ui-kit/shared/useApiStore'
import { apiValidationGroup, chainValidationGroup } from './validation'

export const { useQuery: useOneWayMarketNames, prefetchQuery: prefetchMarkets } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => ['chain', { chainId }, 'markets'] as const,
  queryFn: async (chainId: ChainQuery<ChainId>) => {
    const useAPI = chainId.chainId !== 146 // disable API for sonic
    const api = useApiStore.getState().lending!
    await api.oneWayfactory.fetchMarkets(useAPI)
    const updatedAt = new Date() //
    // Add date to the result so it is not cached by tanstack. Names may not have changed, but individual markets might
    // The right thing to do is to return the markets data instead of the names, but that leaves curveJS in invalid state
    return { updatedAt, markets: api.oneWayfactory.getMarketList() }
  },
  staleTime: '5m',
  refetchInterval: '1m',
  validationSuite: createValidationSuite((params: ChainParams<ChainId>) => {
    chainValidationGroup(params)
    apiValidationGroup(params)
  }),
})
