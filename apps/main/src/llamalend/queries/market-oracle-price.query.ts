import { getLlamaMarket } from '@/llamalend/llama.utils'
import { type MarketQuery, queryFactory, rootKeys, MarketParams } from '@ui-kit/lib/model'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'

export const { useQuery: useMarketOraclePrice } = queryFactory({
  queryKey: ({ chainId, marketId }: MarketParams) =>
    [...rootKeys.market({ chainId, marketId }), 'oraclePrice'] as const,
  queryFn: ({ marketId }: MarketQuery): Promise<string> => getLlamaMarket(marketId).oraclePrice(),
  validationSuite: llamaApiValidationSuite,
})
