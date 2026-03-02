import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { type MarketQuery, queryFactory, rootKeys, MarketParams } from '@ui-kit/lib/model'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'

export const { useQuery: useMarketLiquidationBand } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'market-liquidation-band'] as const,
  queryFn: async ({ marketId }: MarketQuery): Promise<number | null> => {
    const market = getLlamaMarket(marketId)
    if (market instanceof LendMarketTemplate) {
      return (await market.stats.bandsInfo()).liquidationBand
    } else {
      return await market.stats.liquidatingBand()
    }
  },
  category: 'llamalend.market',
  validationSuite: marketIdValidationSuite,
})
