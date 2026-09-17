import { getMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { type MarketQuery, rootKeys, MarketParams } from '@evm-ui/lib/model'
import { marketIdValidationSuite } from '@evm-ui/lib/model/query/market-id-validation'
import { assert } from '@primitives/objects.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { decimal } from '@ui/lib/decimal'
import { IS_GETTER, USE_API } from './market.constants'

export const { useQuery: useMarketTotalDebt } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'totalDebt'] as const,
  queryFn: async ({ marketId }: MarketQuery) => {
    const market = getMarket(marketId)
    const lendMarket = assert(
      market instanceof LendMarketTemplate && market,
      'Total debt is only available for lend markets',
    )
    return decimal(await lendMarket.stats.totalDebt(IS_GETTER, USE_API))!
  },
  category: 'llamalend.market',
  validationSuite: marketIdValidationSuite,
})
