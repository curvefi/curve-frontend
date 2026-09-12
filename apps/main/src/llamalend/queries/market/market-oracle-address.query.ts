import { getStatsImplementation } from '@/llamalend/queries/market/market.query-helpers'
import { MarketParams, type MarketQuery, rootKeys } from '@evm-ui/lib/model'
import { marketIdValidationSuite } from '@evm-ui/lib/model/query/market-id-validation'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useMarketOracleAddress } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'oracleAddress'] as const,
  queryFn: ({ marketId }: MarketQuery): Promise<string> => getStatsImplementation(marketId).oracleAddress(),
  category: 'llamalend.marketParams',
  validationSuite: marketIdValidationSuite,
})
