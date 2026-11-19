import {
  marketCollateralRewardsValidationSuite,
  requireCollateralRewards,
} from '@/llamalend/queries/validation/borrow-claim.validation'
import type { MarketParams, MarketQuery } from '@evm-ui/queries/query-types'
import { queryFactory } from '@ui/features/queries/factory'

/** Stats of the collateral rewards, like the CRV APR in percent of the collateral value. */
export const { useQuery: useMarketCollateralRewardsStats } = queryFactory({
  queryKey: ({ chainId, marketId }: MarketParams) => ({ name: 'collateralRewards.stats', chainId, marketId }) as const,
  queryFn: async ({ marketId }: MarketQuery) => await requireCollateralRewards(marketId).collateralRewards.stats(),
  category: 'llamalend.market',
  validationSuite: marketCollateralRewardsValidationSuite,
})
