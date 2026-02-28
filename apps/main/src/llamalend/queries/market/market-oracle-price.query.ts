import { getLlamaMarket } from '@/llamalend/llama.utils'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { type MarketQuery, queryFactory, rootKeys, MarketParams } from '@ui-kit/lib/model'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'

export const { useQuery: useMarketOraclePrice } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'market-oracle-price'] as const,
  queryFn: ({ marketId }: MarketQuery): Promise<string> => {
    const lib = requireLib('llamaApi')
    const llamaMarket = getLlamaMarket(marketId)
    return llamaMarket.oraclePrice()
  },
  validationSuite: marketIdValidationSuite,
})
