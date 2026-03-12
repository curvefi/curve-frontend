import { getLlamaMarket } from '@/llamalend/llama.utils'
import { type MarketParams, type MarketQuery, queryFactory, rootKeys } from '@ui-kit/lib/model'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'

export const { useQuery: useMarketOraclePrice } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'oraclePrice'] as const,
  queryFn: ({ marketId }: MarketQuery): Promise<string> => getLlamaMarket(marketId).oraclePrice(),
  category: 'llamalend.market',
  validationSuite: marketIdValidationSuite,
})
