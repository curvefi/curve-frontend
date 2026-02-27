import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { type MarketQuery, queryFactory, rootKeys, MarketParams } from '@ui-kit/lib/model'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'
import { convertRates } from '../../rates.utils'

const [isGetter, useAPI] = [true, true] as const

export const { useQuery: useMarketRates, invalidate: invalidateMarketRates } = queryFactory({
  queryKey: ({ chainId, marketId }: MarketParams) =>
    [...rootKeys.market({ chainId, marketId }), 'market-rates'] as const,
  queryFn: async ({ marketId }: MarketQuery) => {
    const market = getLlamaMarket(marketId)
    return convertRates(
      market instanceof LendMarketTemplate
        ? await market.stats.rates(isGetter, useAPI)
        : (await market.stats.parameters()).rates,
    )
  },
  category: 'llamalend.market',
  validationSuite: llamaApiValidationSuite,
})
