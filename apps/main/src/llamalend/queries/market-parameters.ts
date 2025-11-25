import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { queryFactory } from '@ui-kit/lib/model/query'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import { rootKeys } from '@ui-kit/lib/model/query/root-keys'
import type { MarketQuery, MarketParams } from '@ui-kit/lib/model/query/root-keys'
import { getLlamaMarket } from '../llama.utils'

export const { useQuery: useMarketParameters } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'market-parameters'] as const,
  queryFn: async ({ marketId }: MarketQuery) => {
    const market = getLlamaMarket(marketId)

    if (market instanceof MintMarketTemplate) {
      // Mint markets don't have their A value in the parameters
      // object, but we want it regardless for type similarity
      // with lend markets.
      const parameters = await market.stats.parameters()
      return { ...parameters, A: market.A.toString() }
    } else {
      const parameters = await market.stats.parameters()
      return parameters
    }
  },
  refetchInterval: '1m',
  validationSuite: marketIdValidationSuite,
})
