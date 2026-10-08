import { getMarket, isLendMarket } from '@/llamalend/llama.utils'
import type { MarketQuery, MarketParams } from '@evm-ui/queries/query-types'
import { marketIdValidationSuite } from '@evm-ui/queries/validation/market-id-validation'
import { queryFactory } from '@ui/features/queries/factory'
import { decimal } from '@ui/lib/decimal'
import { IS_GETTER, USE_API } from './market.constants'

export const { useQuery: useMarketTotalCollateral } = queryFactory({
  queryKey: ({ chainId, marketId }: MarketParams) => ({ name: 'totalCollateral', chainId, marketId }) as const,
  queryFn: async ({ marketId }: MarketQuery) => {
    const market = getMarket(marketId)

    if (isLendMarket(market)) {
      const totalCollateral = await market.stats.ammBalances(IS_GETTER, USE_API)
      return { collateral: decimal(totalCollateral.collateral), borrowed: decimal(totalCollateral.borrowed) }
    }
    const [totalCollateral, totalBorrowed] = await Promise.all([
      market.stats.totalCollateral(),
      market.stats.totalStablecoin(),
    ])
    return { collateral: decimal(totalCollateral), borrowed: decimal(totalBorrowed) }
  },
  category: 'llamalend.market',
  validationSuite: marketIdValidationSuite,
})
