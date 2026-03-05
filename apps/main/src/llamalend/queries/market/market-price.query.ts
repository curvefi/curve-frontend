import { getLlamaMarket } from '@/llamalend/llama.utils'
import { type MarketQuery, queryFactory, rootKeys, MarketParams } from '@ui-kit/lib/model'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'

export const { useQuery: useMarketPrice } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'market-price'] as const,
  queryFn: ({ marketId }: MarketQuery): Promise<string> => {
    const market = getLlamaMarket(marketId)
    const prices = 'prices' in market ? market.prices : market
    return prices.price()
  },
  category: 'llamalend.market',
  validationSuite: marketIdValidationSuite,
})
