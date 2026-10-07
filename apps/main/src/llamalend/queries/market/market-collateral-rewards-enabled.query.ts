import {
  marketCollateralRewardsValidationSuite,
  requireCollateralRewards,
} from '@/llamalend/queries/validation/borrow-claim.validation'
import type { MarketParams, MarketQuery } from '@evm-ui/queries/query-types'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useMarketCollateralRewardsEnabled } = queryFactory({
  queryKey: ({ chainId, marketId }: MarketParams) =>
    ({ name: 'collateralRewards.enabled', chainId, marketId }) as const,
  queryFn: async ({ marketId }: MarketQuery) =>
    await requireCollateralRewards(marketId).collateralRewards.isCollateralRewardEnable(),
  category: 'llamalend.market',
  validationSuite: marketCollateralRewardsValidationSuite,
})
