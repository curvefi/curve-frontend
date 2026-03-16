import { getLlamaMarket } from '@/llamalend/llama.utils'
import { type MarketQuery, queryFactory, rootKeys, MarketParams } from '@ui-kit/lib/model'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'

export const { useQuery: useMarketBasePrice } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'basePrice'] as const,
  queryFn: ({ marketId }: MarketQuery): Promise<string> => getLlamaMarket(marketId).basePrice(),
  category: 'llamalend.market',
  validationSuite: marketIdValidationSuite,
})
