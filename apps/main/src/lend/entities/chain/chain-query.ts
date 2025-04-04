import { ChainId } from '@/lend/types/lend.types'
import { ChainParams, ChainQuery, queryFactory } from '@ui-kit/lib/model/query'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { useApiStore } from '@ui-kit/shared/useApiStore'
import { Chain } from '@ui-kit/utils'
import { apiValidationGroup, chainValidationGroup } from './validation'

export const { useQuery: useOneWayMarketNames, prefetchQuery: prefetchMarkets } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => ['chain', { chainId }, 'markets'] as const,
  queryFn: async (chainId: ChainQuery<ChainId>): Promise<string[]> => {
    const useAPI = chainId.chainId !== Chain.Sonic // disable API for sonic
    const api = useApiStore.getState().llamalend!
    await api.lendMarkets.fetchMarkets(useAPI)
    return api.lendMarkets.getMarketList()
  },
  staleTime: '5m',
  refetchInterval: '1m',
  validationSuite: createValidationSuite((params: ChainParams<ChainId>) => {
    chainValidationGroup(params)
    apiValidationGroup(params)
  }),
})
