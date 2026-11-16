import {
  marketCollateralRewardsValidationSuite,
  requireCollateralRewards,
} from '@/llamalend/queries/validation/borrow-claim.validation'
import type { MarketParams, MarketQuery } from '@evm-ui/queries/query-types'
import { queryFactory } from '@ui/features/queries/factory'

/** CRV APR on the collateral, in percent of the collateral value. Disabled for markets without collateral rewards. */
export const { useQuery: useMarketCollateralCrvApr } = queryFactory({
  queryKey: ({ chainId, marketId }: MarketParams) => ({ name: 'collateralRewards.crvApr', chainId, marketId }) as const,
  queryFn: async ({ marketId }: MarketQuery) =>
    (await requireCollateralRewards(marketId).collateralRewards.stats()).crvApr,
  category: 'llamalend.market',
  validationSuite: marketCollateralRewardsValidationSuite,
})
