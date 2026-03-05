import { getLlamaMarket } from '@/llamalend/llama.utils'
import { getMarketPricesImpl } from '@/llamalend/queries/market/market.query-helpers'
import { MarketParams, type MarketQuery, queryFactory, rootKeys } from '@ui-kit/lib/model'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'

export const { useQuery: useMarketPrice } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'market-price'] as const,
  queryFn: ({ marketId }: MarketQuery): Promise<string> => {
    const market = getLlamaMarket(marketId)
    return getMarketPricesImpl(market).price()
  },
  category: 'llamalend.market',
  validationSuite: marketIdValidationSuite,
})
