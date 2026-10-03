import { getMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { MarketQuery, MarketParams } from '@evm-ui/queries/query-types'
import { marketIdValidationSuite } from '@evm-ui/queries/validation/market-id-validation'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useMarketLiquidationBand } = queryFactory({
  queryKey: ({ chainId, marketId }: MarketParams) => ({ name: 'liquidationBand', chainId, marketId }),
  queryFn: async ({ marketId }: MarketQuery): Promise<number | null> => {
    const market = getMarket(marketId)
    return market instanceof LendMarketTemplate
      ? (await market.stats.bandsInfo()).liquidationBand
      : await market.stats.liquidatingBand()
  },
  category: 'llamalend.market',
  validationSuite: marketIdValidationSuite,
})
