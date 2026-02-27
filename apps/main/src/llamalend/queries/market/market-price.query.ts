import { getLlamaMarket } from '@/llamalend/llama.utils'
import { type MarketQuery, queryFactory, rootKeys, MarketParams } from '@ui-kit/lib/model'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'

export const { useQuery: useMarketPrice } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'market-price'] as const,
  queryFn: ({ marketId }: MarketQuery): Promise<string> => getLlamaMarket(marketId).price(),
  category: 'detail',
  validationSuite: marketIdValidationSuite,
})
