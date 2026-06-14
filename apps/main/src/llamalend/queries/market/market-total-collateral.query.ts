import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { Decimal } from '@primitives/decimal.utils'
import { type MarketQuery, queryFactory, rootKeys, MarketParams } from '@ui-kit/lib/model'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import { IS_GETTER, USE_API } from './market.constants'

export const { useQuery: useMarketTotalCollateral, invalidate: invalidateMarketTotalCollateral } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'totalCollateral'] as const,
  queryFn: async ({ marketId }: MarketQuery) => {
    const market = getLlamaMarket(marketId)

    if (market instanceof LendMarketTemplate) {
      const { borrowed, collateral } = await market.stats.ammBalances(IS_GETTER, USE_API)
      return { collateral: collateral as Decimal, borrowed: borrowed as Decimal }
    }
    const [totalCollateral, totalBorrowed] = await Promise.all([
      market.stats.totalCollateral(),
      market.stats.totalStablecoin(),
    ])
    return { collateral: totalCollateral as Decimal, borrowed: totalBorrowed as Decimal }
  },
  category: 'llamalend.market',
  validationSuite: marketIdValidationSuite,
})
