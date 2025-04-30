import { ChainId, type LlamalendApi } from '@/lend/types/lend.types'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { ChainParams, ChainQuery, queryFactory } from '@ui-kit/lib/model/query'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { apiValidationGroup, chainValidationGroup } from './validation'

export const { useQuery: useOneWayMarketNames, prefetchQuery: prefetchMarkets } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => ['chain', { chainId }, 'markets'] as const,
  queryFn: async ({ chainId }: ChainQuery<ChainId>): Promise<string[]> => {
    const useAPI = chainId !== 146 // disable API for sonic
    const api = requireLib<LlamalendApi>()
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
