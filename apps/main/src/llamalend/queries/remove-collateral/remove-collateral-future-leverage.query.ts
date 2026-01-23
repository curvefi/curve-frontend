import { getLlamaMarket, hasSupportedLeverage } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { decimal } from '@ui-kit/utils/decimal'
import { type CollateralParams, type CollateralQuery } from '../validation/manage-loan.types'
import { collateralValidationSuite } from '../validation/manage-loan.validation'

/**
 * Query to get the user's expected leverage value in a position, after removing userCollateral
 * Note this does not support leverage values for old mint markets (marketId < 6).
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
    return hasSupportedLeverage(market)
      ? (decimal(await market.removeCollateralFutureLeverage(userCollateral)) ?? null)
      : null
  },
  validationSuite: collateralValidationSuite,
})
