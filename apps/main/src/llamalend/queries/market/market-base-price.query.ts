import { getPricesImplementation } from '@/llamalend/queries/market/market.query-helpers'
import { MarketParams, type MarketQuery, queryFactory, rootKeys } from '@ui-kit/lib/model'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'

export const { useQuery: useMarketBasePrice } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'basePrice'] as const,
  queryFn: ({ marketId }: MarketQuery): Promise<string> => getPricesImplementation(marketId).basePrice(),
  category: 'llamalend.market',
  validationSuite: marketIdValidationSuite,
})
