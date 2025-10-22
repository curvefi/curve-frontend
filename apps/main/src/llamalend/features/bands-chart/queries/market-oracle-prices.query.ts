import { getLlamaMarket } from '@/llamalend/llama.utils'
import type { MarketQuery, MarketParams } from '@ui-kit/lib/model'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'
import { decimal, Decimal } from '@ui-kit/utils'

export const { useQuery: useMarketOraclePrices } = queryFactory({
  queryKey: ({ chainId, marketId }: MarketParams) =>
    [...rootKeys.market({ chainId, marketId }), 'market-oracle-prices'] as const,
  queryFn: async ({ marketId }: MarketQuery) => {
    const market = getLlamaMarket(marketId)
    const [oraclePrice, oraclePriceBand, price, basePrice] = await Promise.all([
      market.oraclePrice(),
      market.oraclePriceBand(),
      market.price(),
      market.basePrice(),
    ])
    return { oraclePrice, oraclePriceBand, price, basePrice }
  },
  validationSuite: llamaApiValidationSuite,
})
