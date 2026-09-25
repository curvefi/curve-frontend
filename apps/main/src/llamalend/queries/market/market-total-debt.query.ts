import { getMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { type MarketQuery, rootKeys, MarketParams } from '@evm-ui/queries/root-keys'
import { marketIdValidationSuite } from '@evm-ui/queries/validation/market-id-validation'
import { queryFactory } from '@ui/features/queries/factory'
import { decimal } from '@ui/lib/decimal'
import { IS_GETTER, USE_API } from './market.constants'

export const { useQuery: useMarketTotalDebt } = queryFactory({
  queryKey: (params: MarketParams) => [rootKeys.market(params), { name: 'totalDebt' }] as const,
  queryFn: async ({ marketId }: MarketQuery) => {
    const market = getMarket(marketId)
    const totalDebt =
      market instanceof LendMarketTemplate
        ? await market.stats.totalDebt(IS_GETTER, USE_API)
        : await market.stats.totalDebt()
    return decimal(totalDebt)!
  },
  category: 'llamalend.market',
  validationSuite: marketIdValidationSuite,
})
