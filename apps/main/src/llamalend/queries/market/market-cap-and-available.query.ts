import { getMarket, isLendMarket } from '@/llamalend/llama.utils'
import type { MarketQuery, MarketParams } from '@evm-ui/queries/query-types'
import { marketIdValidationSuite } from '@evm-ui/queries/validation/market-id-validation'
import { queryFactory } from '@ui/features/queries/factory'
import { decimal } from '@ui/lib/decimal'
import { IS_GETTER, USE_API } from './market.constants'

export const { useQuery: useMarketCapAndAvailable } = queryFactory({
  queryKey: ({ chainId, marketId }: MarketParams) =>
    ({ name: 'capAndAvailable', version: 1, chainId, marketId }) as const,
  queryFn: async ({ marketId }: MarketQuery) => {
    const market = getMarket(marketId)
    if (isLendMarket(market)) {
      const { available, totalAssets, borrowCap } = await market.stats.capAndAvailable(IS_GETTER, USE_API)
      return { totalAssets: decimal(totalAssets), available: decimal(available), borrowCap: decimal(borrowCap) }
    }
    const { available, cap } = await market.stats.capAndAvailable()
    return { totalAssets: decimal(cap), available: decimal(available) }
  },
  category: 'llamalend.market',
  validationSuite: marketIdValidationSuite,
})
