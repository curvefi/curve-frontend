import { getPricesImplementation } from '@/llamalend/queries/market/market.query-helpers'
import { type MarketQuery, queryFactory, rootKeys, MarketParams } from '@ui-kit/lib/model'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'

export const { useQuery: useMarketOracleAddress } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'oracleAddress'] as const,
  queryFn: ({ marketId }: MarketQuery): Promise<string> => getPricesImplementation(marketId).oracleAddress(),
  category: 'llamalend.market',
  validationSuite: marketIdValidationSuite,
})
