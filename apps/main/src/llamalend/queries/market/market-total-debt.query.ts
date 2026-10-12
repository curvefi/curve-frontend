import { getMarket, isLendMarket } from '@/llamalend/llama.utils'
import type { MarketQuery, MarketParams } from '@evm-ui/queries/query-types'
import { marketIdValidationSuite } from '@evm-ui/queries/validation/market-id-validation'
import { queryFactory } from '@ui/features/queries/factory'
import { decimal } from '@ui/lib/decimal'
import { IS_GETTER, USE_API } from './market.constants'

export const { useQuery: useMarketTotalDebt } = queryFactory({
  queryKey: ({ chainId, marketId }: MarketParams) => ({ name: 'totalDebt', chainId, marketId }) as const,
  queryFn: async ({ marketId }: MarketQuery) => {
    const market = getMarket(marketId)
    const totalDebt = isLendMarket(market)
      ? await market.stats.totalDebt(IS_GETTER, USE_API)
      : await market.stats.totalDebt()
    return decimal(totalDebt)!
  },
  category: 'llamalend.market',
  validationSuite: marketIdValidationSuite,
})
