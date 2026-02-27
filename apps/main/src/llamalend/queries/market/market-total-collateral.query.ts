import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { type MarketQuery, queryFactory, rootKeys, MarketParams } from '@ui-kit/lib/model'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import { decimal } from '@ui-kit/utils'
import { IS_GETTER, USE_API } from './market.constants'

export const { useQuery: useMarketTotalCollateral, invalidate: invalidateMarketTotalCollateral } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'market-total-collateral'] as const,
  queryFn: async ({ marketId }: MarketQuery) => {
    const market = getLlamaMarket(marketId)

    if (market instanceof LendMarketTemplate) {
      const totalCollateral = await market.stats.ammBalances(IS_GETTER, USE_API)
      return {
        collateral: decimal(totalCollateral.collateral),
        borrowed: decimal(totalCollateral.borrowed),
      }
    }

    const totalCollateral = await market.stats.totalCollateral()
    const totalBorrowed = await market.stats.totalStablecoin()
    return { collateral: decimal(totalCollateral), borrowed: decimal(totalBorrowed) }
  },
  category: 'detail',
  validationSuite: marketIdValidationSuite,
})
