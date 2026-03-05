import { getLlamaMarket } from '@/llamalend/llama.utils'
import { getMarketPricesImpl } from '@/llamalend/queries/market/market.query-helpers'
import { MarketParams, type MarketQuery, queryFactory, rootKeys } from '@ui-kit/lib/model'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'

export const { useQuery: useMarketOraclePriceBand } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'market-oracle-price-band'] as const,
  queryFn: ({ marketId }: MarketQuery): Promise<number> => {
    const market = getLlamaMarket(marketId)
    return getMarketPricesImpl(market).oraclePriceBand()
  },
  category: 'llamalend.market',
  validationSuite: marketIdValidationSuite,
})
1
