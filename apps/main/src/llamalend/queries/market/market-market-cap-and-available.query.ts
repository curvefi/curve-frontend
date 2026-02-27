import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { type MarketQuery, queryFactory, rootKeys, MarketParams } from '@ui-kit/lib/model'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import { decimal } from '@ui-kit/utils'
import { IS_GETTER, USE_API } from './market.constants'

export const { useQuery: useMarketCapAndAvailable, invalidate: invalidateMarketCapAndAvailable } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'marketCapAndAvailable', 'v1'] as const,
  queryFn: async ({ marketId }: MarketQuery) => {
    const market = getLlamaMarket(marketId)
    const capAndAvailable =
      market instanceof LendMarketTemplate
        ? await market.stats.capAndAvailable(IS_GETTER, USE_API)
        : await market.stats.capAndAvailable()
    return {
      cap: decimal(capAndAvailable.cap),
      available: decimal(capAndAvailable.available),
    }
  },
  refetchInterval: '1m',
  validationSuite: marketIdValidationSuite,
})
