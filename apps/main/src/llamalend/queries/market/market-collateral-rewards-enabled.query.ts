import { getMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
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
    return market instanceof LendMarketTemplate && (await market.collateralRewards.isCollateralRewardEnable())
  },
  category: 'llamalend.market',
  validationSuite: marketIdValidationSuite,
})
