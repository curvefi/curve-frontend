import { createClaimEstimateGasHook } from '@evm-ui/queries/gas-info.query'
import { rootKeys, type UserMarketParams, type UserMarketQuery } from '@evm-ui/queries/root-keys'
import { queryFactory } from '@ui/features/queries/factory'
import { borrowClaimValidationSuite, requireCollateralRewards } from '../validation/borrow-claim.validation'
import { useBorrowClaimableCrv } from './borrow-claimable-crv.query'

const { useQuery: useBorrowClaimCrvEstimateGasQuery } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: UserMarketParams) => ({
    name: 'collateralRewards.estimateGas.claimCrv',
    ...rootKeys.userMarket({ chainId, marketId, userAddress }),
  }),
  queryFn: async ({ marketId }: UserMarketQuery) =>
    await requireCollateralRewards(marketId).collateralRewards.estimateGas.claimCrv(),
  category: 'llamalend.collateralRewards',
  validationSuite: borrowClaimValidationSuite,
})

export const useBorrowClaimCrvEstimateGas = createClaimEstimateGasHook(
  useBorrowClaimableCrv,
  useBorrowClaimCrvEstimateGasQuery,
  claimable => Number(claimable) > 0,
)
