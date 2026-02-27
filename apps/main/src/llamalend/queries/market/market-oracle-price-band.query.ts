import { getLlamaMarket } from '@/llamalend/llama.utils'
import { type MarketQuery, queryFactory, rootKeys, MarketParams } from '@ui-kit/lib/model'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'

export const { useQuery: useMarketOraclePriceBand } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'market-oracle-price-band'] as const,
  queryFn: ({ marketId }: MarketQuery): Promise<number> => getLlamaMarket(marketId).oraclePriceBand(),
  validationSuite: marketIdValidationSuite,
})
