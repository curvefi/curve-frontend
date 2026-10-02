import {
  marketCollateralRewardsValidationSuite,
  requireCollateralRewards,
} from '@/llamalend/queries/validation/borrow-claim.validation'
import { rootKeys, type MarketParams, type MarketQuery } from '@evm-ui/queries/root-keys'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useMarketCollateralRewardsEnabled } = queryFactory({
  queryKey: ({ chainId, marketId }: MarketParams) => ({
    name: 'collateralRewards.enabled',
    ...rootKeys.market({ chainId, marketId }),
  }),
  queryFn: async ({ marketId }: MarketQuery) =>
    await requireCollateralRewards(marketId).collateralRewards.isCollateralRewardEnable(),
  category: 'llamalend.market',
  validationSuite: marketCollateralRewardsValidationSuite,
})
