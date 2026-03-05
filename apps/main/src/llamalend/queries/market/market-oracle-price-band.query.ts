import { getPricesImplementation } from '@/llamalend/queries/market/market.query-helpers'
import { MarketParams, type MarketQuery, queryFactory, rootKeys } from '@ui-kit/lib/model'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'

export const { useQuery: useMarketOraclePriceBand } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'market-oracle-price-band'] as const,
  queryFn: ({ marketId }: MarketQuery): Promise<number> => getPricesImplementation(marketId).oraclePriceBand(),
  category: 'llamalend.market',
  validationSuite: marketIdValidationSuite,
})
1
