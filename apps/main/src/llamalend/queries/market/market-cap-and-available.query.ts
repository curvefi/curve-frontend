import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { Decimal } from '@primitives/decimal.utils'
import { type MarketQuery, queryFactory, rootKeys, MarketParams } from '@ui-kit/lib/model'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import { IS_GETTER, USE_API } from './market.constants'

export const { useQuery: useMarketCapAndAvailable, invalidate: invalidateMarketCapAndAvailable } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'capAndAvailable', 'v1'] as const,
  queryFn: async ({ marketId }: MarketQuery) => {
    const market = getLlamaMarket(marketId)
    if (market instanceof LendMarketTemplate) {
      const { available, totalAssets, borrowCap } = await market.stats.capAndAvailable(IS_GETTER, USE_API)
      return { totalAssets: totalAssets as Decimal, available: available as Decimal, borrowCap: borrowCap as Decimal }
    }
    const { available, cap } = await market.stats.capAndAvailable()
    return { totalAssets: cap as Decimal, available: available as Decimal }
  },
  category: 'llamalend.market',
  validationSuite: marketIdValidationSuite,
})
