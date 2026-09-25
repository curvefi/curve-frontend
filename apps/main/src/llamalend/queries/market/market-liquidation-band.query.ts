import { getMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { type MarketQuery, rootKeys, MarketParams } from '@evm-ui/queries/root-keys'
import { marketIdValidationSuite } from '@evm-ui/queries/validation/market-id-validation'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useMarketLiquidationBand } = queryFactory({
  queryKey: (params: MarketParams) => [rootKeys.market(params), { name: 'liquidationBand' }] as const,
  queryFn: async ({ marketId }: MarketQuery): Promise<number | null> => {
    const market = getMarket(marketId)
    return market instanceof LendMarketTemplate
      ? (await market.stats.bandsInfo()).liquidationBand
      : await market.stats.liquidatingBand()
  },
  category: 'llamalend.market',
  validationSuite: marketIdValidationSuite,
})
