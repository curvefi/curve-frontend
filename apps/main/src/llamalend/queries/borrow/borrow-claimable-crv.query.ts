import { rootKeys, type UserMarketParams, type UserMarketQuery } from '@evm-ui/queries/root-keys'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { borrowClaimValidationSuite, requireCollateralRewards } from '../validation/borrow-claim.validation'

export const { useQuery: useBorrowClaimableCrv, fetchQuery: fetchBorrowClaimableCrv } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: UserMarketParams) => ({
    name: 'collateralRewards.claimableCrv',
    ...rootKeys.userMarket({ chainId, marketId, userAddress }),
  }),
  queryFn: async ({ marketId, userAddress }: UserMarketQuery) =>
    (await requireCollateralRewards(marketId).collateralRewards.claimableCrv(userAddress)) as Decimal,
  category: 'llamalend.collateralRewards',
  validationSuite: borrowClaimValidationSuite,
})
