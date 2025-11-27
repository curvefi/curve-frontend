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
    // Mint markets don't have their A value in the parameters
    // object, but we want it regardless for type similarity
    // with lend markets.
    return market instanceof MintMarketTemplate
      ? { ...(await market.stats.parameters()), A: market.A.toString() }
      : await market.stats.parameters()
  },
  refetchInterval: '1m',
  validationSuite: marketIdValidationSuite,
})
