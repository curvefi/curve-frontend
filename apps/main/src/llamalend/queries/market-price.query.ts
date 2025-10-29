import { getLlamaMarket } from '@/llamalend/llama.utils'
import { type MarketQuery, queryFactory, rootKeys, MarketParams } from '@ui-kit/lib/model'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'

export const { useQuery: useMarketPrice } = queryFactory({
  queryKey: ({ chainId, marketId }: MarketParams) => [...rootKeys.market({ chainId, marketId }), 'price'] as const,
  queryFn: ({ marketId }: MarketQuery): Promise<string> => getLlamaMarket(marketId).price(),
  validationSuite: marketIdValidationSuite,
})
