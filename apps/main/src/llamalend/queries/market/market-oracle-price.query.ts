import { getPricesImplementation } from '@/llamalend/queries/market/market.query-helpers'
import { MarketParams, type MarketQuery, queryFactory, rootKeys } from '@ui-kit/lib/model'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'

export const { useQuery: useMarketOraclePrice } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'market-oracle-price'] as const,
  queryFn: ({ marketId }: MarketQuery): Promise<string> => getPricesImplementation(marketId).oraclePrice(),
  category: 'llamalend.market',
  validationSuite: marketIdValidationSuite,
})
