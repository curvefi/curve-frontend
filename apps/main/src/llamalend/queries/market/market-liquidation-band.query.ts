import { getMarket, isLendMarket } from '@/llamalend/llama.utils'
import type { MarketQuery, MarketParams } from '@evm-ui/queries/query-types'
import { marketIdValidationSuite } from '@evm-ui/queries/validation/market-id-validation'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useMarketLiquidationBand } = queryFactory({
  queryKey: ({ chainId, marketId }: MarketParams) => ({ name: 'liquidationBand', chainId, marketId }) as const,
  queryFn: async ({ marketId }: MarketQuery): Promise<number | null> => {
    const market = getMarket(marketId)
    return isLendMarket(market)
      ? (await market.stats.bandsInfo()).liquidationBand
      : await market.stats.liquidatingBand()
  },
  category: 'llamalend.market',
  validationSuite: marketIdValidationSuite,
})
