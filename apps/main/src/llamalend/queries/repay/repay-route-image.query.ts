import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { type RepayParams, type RepayQuery } from '../validation/manage-loan.types'
import { repayValidationSuite } from '../validation/manage-loan.validation'

export const { useQuery: useRepayRouteImage } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    stateCollateral = '0',
    userCollateral = '0',
    userBorrowed = '0',
    userAddress,
  }: RepayParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'repayRouteImage',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
    ] as const,
  queryFn: async ({ marketId, stateCollateral, userCollateral }: RepayQuery) => {
    const market = getLlamaMarket(marketId)
    if (market instanceof LendMarketTemplate) {
      return await market.leverage.repayRouteImage(stateCollateral, userCollateral)
    }
    if (market.leverageV2.hasLeverage()) {
      return await market.leverageV2.repayRouteImage(stateCollateral, userCollateral)
    }
    return null
  },
  staleTime: '1m',
  validationSuite: repayValidationSuite({ leverageRequired: true }),
})
