import { getLlamaMarket } from '@/llamalend/llama.utils'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { decimal } from '@ui-kit/utils/decimal'
import { userCurrentLeverageQueryKey } from '../user/user-current-leverage.query'
import { type CollateralParams, type CollateralQuery } from '../validation/manage-loan.types'
import { leverageCollateralValidationSuite } from '../validation/manage-loan.validation'

/**
 * Query to get the user's expected leverage value in a position, after removing userCollateral
 * Note this does not support leverage values for old mint markets (marketId < 6).
 */
export const { useQuery: useRemoveCollateralFutureLeverage, invalidate: invalidateRemoveCollateralFutureLeverage } =
  queryFactory({
    queryKey: ({ chainId, marketId, userAddress, userCollateral }: CollateralParams) =>
      [
        ...rootKeys.userMarket({ chainId, marketId, userAddress }),
        'removeCollateralFutureLeverage',
        { userCollateral },
      ] as const,
    queryFn: async ({ marketId, userAddress, userCollateral }: CollateralQuery) => {
      const market = getLlamaMarket(marketId)
      return decimal(await market.removeCollateralFutureLeverage(userCollateral, userAddress)) ?? null
    },
    category: 'llamalend.removeCollateral',
    validationSuite: leverageCollateralValidationSuite,
    dependencies: (params) => [userCurrentLeverageQueryKey(params)],
  })
