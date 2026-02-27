import { getLlamaMarket } from '@/llamalend/llama.utils'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { decimal } from '@ui-kit/utils/decimal'
import { type CollateralParams, type CollateralQuery } from '../validation/manage-loan.types'
import { leverageCollateralValidationSuite } from '../validation/manage-loan.validation'

/**
 * Query to get the user's expected leverage value in a position, after adding userCollateral
 * Note this does not support leverage values for old mint markets (marketId < 6).
 */
export const { useQuery: useAddCollateralFutureLeverage } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, userCollateral }: CollateralParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'addCollateralFutureLeverage',
      { userCollateral },
    ] as const,
  queryFn: async ({ marketId, userCollateral }: CollateralQuery) => {
    const market = getLlamaMarket(marketId)
    return decimal(await market.addCollateralFutureLeverage(userCollateral)) ?? null
  },
  category: 'user',
  validationSuite: leverageCollateralValidationSuite,
})
