import { getStatsImplementation } from '@/llamalend/queries/market/market.query-helpers'
import { MarketParams, type MarketQuery, queryFactory, rootKeys } from '@ui-kit/lib/model'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'

export const { useQuery: useMarketOracleAddress } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'oracleAddress'] as const,
  queryFn: ({ marketId }: MarketQuery): Promise<string> => getStatsImplementation(marketId).oracleAddress(),
  category: 'llamalend.marketParams',
  validationSuite: marketIdValidationSuite,
})
