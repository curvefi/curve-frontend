import type { UserMarketParams, UserMarketQuery } from '@evm-ui/queries/query-types'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { borrowClaimValidationSuite, requireCollateralRewards } from '../validation/borrow-claim.validation'

export const { useQuery: useBorrowClaimableCrv, fetchQuery: fetchBorrowClaimableCrv } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: UserMarketParams) =>
    ({ name: 'collateralRewards.claimableCrv', chainId, marketId, userAddress }) as const,
  queryFn: async ({ marketId, userAddress }: UserMarketQuery) =>
    (await requireCollateralRewards(marketId).collateralRewards.claimableCrv(userAddress)) as Decimal,
  category: 'llamalend.collateralRewards',
  validationSuite: borrowClaimValidationSuite,
})
