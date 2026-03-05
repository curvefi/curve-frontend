import { getPricesImplementation } from '@/llamalend/queries/market/market.query-helpers'
import { MarketParams, type MarketQuery, queryFactory, rootKeys } from '@ui-kit/lib/model'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'

export const { useQuery: useMarketPrice } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'market-price'] as const,
  queryFn: ({ marketId }: MarketQuery): Promise<string> => getPricesImplementation(marketId).price(),
  category: 'llamalend.market',
  validationSuite: marketIdValidationSuite,
})
