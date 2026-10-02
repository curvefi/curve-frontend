import { getMarket, supportsCollateralRewards } from '@/llamalend/llama.utils'
import { rootKeys, type MarketParams, type MarketQuery } from '@evm-ui/queries/root-keys'
import { marketIdValidationSuite } from '@evm-ui/queries/validation/market-id-validation'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useMarketCollateralRewardsEnabled } = queryFactory({
  queryKey: ({ chainId, marketId }: MarketParams) => ({
    name: 'collateralRewards.enabled',
    ...rootKeys.market({ chainId, marketId }),
  }),
  queryFn: async ({ marketId }: MarketQuery) => {
    const market = getMarket(marketId)
    return supportsCollateralRewards(market) && (await market.collateralRewards.isCollateralRewardEnable())
  },
  category: 'llamalend.market',
  validationSuite: marketIdValidationSuite,
})
