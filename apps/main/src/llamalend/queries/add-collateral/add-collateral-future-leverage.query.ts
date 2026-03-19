import { getLoanImplementation } from '@/llamalend/queries/market/market.query-helpers'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { decimal } from '@ui-kit/utils/decimal'
import { userCurrentLeverageQueryKey } from '../user/user-current-leverage.query'
import { type CollateralParams, type CollateralQuery } from '../validation/manage-loan.types'
import { leverageCollateralValidationSuite } from '../validation/manage-loan.validation'

/**
 * Query to get the user's expected leverage value in a position, after adding userCollateral
 * Note this does not support leverage values for old mint markets (marketId < 6).
 */
export const { useQuery: useAddCollateralFutureLeverage, invalidate: invalidateAddCollateralFutureLeverage } =
  queryFactory({
    queryKey: ({ chainId, marketId, userAddress, userCollateral }: CollateralParams) =>
      [
        ...rootKeys.userMarket({ chainId, marketId, userAddress }),
        'addCollateralFutureLeverage',
        { userCollateral },
      ] as const,
    queryFn: async ({ marketId, userAddress, userCollateral }: CollateralQuery) =>
      decimal(await getLoanImplementation(marketId).addCollateralFutureLeverage(userCollateral, userAddress)) ?? null,
    category: 'llamalend.addCollateral',
    validationSuite: leverageCollateralValidationSuite,
    dependencies: (params) => [userCurrentLeverageQueryKey(params)],
  })
