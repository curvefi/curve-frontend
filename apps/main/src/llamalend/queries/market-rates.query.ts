import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { type MarketQuery, queryFactory, rootKeys, MarketParams } from '@ui-kit/lib/model'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import type { Decimal } from '@ui-kit/utils'

export const { useQuery: useMarketRates } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'market-rates'] as const,
  queryFn: async ({ marketId }: MarketQuery) => {
    const market = getLlamaMarket(marketId)
    return market instanceof LendMarketTemplate
      ? {
          ...(await market.stats.rates().then((x) => ({
            borrowApr: x.borrowApr as Decimal,
            borrowApy: x.borrowApy as Decimal,
            lendApr: x.lendApr as Decimal,
            lendApy: x.lendApy as Decimal,
          }))),
        }
      : { borrowApr: (await market.stats.parameters()).rate as Decimal }
  },
  validationSuite: marketIdValidationSuite,
})
