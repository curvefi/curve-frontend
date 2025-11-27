import { getLlamaMarket } from '@/llamalend/llama.utils'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { queryFactory, rootKeys, type MarketParams, type MarketQuery } from '@ui-kit/lib/model'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'

/**
 * This query exists to check if v2 leverage exists in a mint market.
 * PNL data from llamalend-js for mint markets is currently only avaiable when v2 leverage is enabled.
 */
export const {
  useQuery: useHasV2Leverage,
  refetchQuery: refetchHasV2Leverage,
  getQueryData: getHasV2Leverage,
} = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'market-has-v2-leverage'] as const,
  queryFn: async ({ marketId }: MarketQuery) => {
    const market = getLlamaMarket(marketId)
    return market instanceof MintMarketTemplate ? market.leverageV2.hasLeverage() : false
  },
  staleTime: '1m',
  validationSuite: marketIdValidationSuite,
})
