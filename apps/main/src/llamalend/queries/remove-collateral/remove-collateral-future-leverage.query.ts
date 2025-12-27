import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { decimal } from '@ui-kit/utils/decimal'
import { type CollateralParams, type CollateralQuery } from '../validation/manage-loan.types'
import { collateralValidationSuite } from '../validation/manage-loan.validation'

/**
 * Query to get the user's expected leverage value in a position, after removing userCollateral
 * Note this is ONLY valid for lend market.
 */
export const { useQuery: useRemoveCollateralFutureLeverage } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, userCollateral }: CollateralParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'removeCollateralFutureLeverage',
      { userCollateral },
    ] as const,
  queryFn: async ({ marketId, userCollateral }: CollateralQuery) => {
    const market = getLlamaMarket(marketId)
    // TODO: get expected leverage value for new mint markets as well
    return market instanceof LendMarketTemplate
      ? (decimal(await market.removeCollateralFutureLeverage(userCollateral)) ?? null)
      : null
  },
  validationSuite: collateralValidationSuite,
})
