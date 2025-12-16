import { getLlamaMarket, hasLeverage } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { type RepayParams, type RepayQuery } from '../validation/manage-loan.types'
import { repayValidationSuite } from '../validation/manage-loan.validation'

export const { useQuery: useRepayIsAvailable } = queryFactory({
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
      'repayIsAvailable',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
    ] as const,
  queryFn: async ({
    marketId,
    stateCollateral,
    userCollateral,
    userBorrowed,
    userAddress,
  }: RepayQuery): Promise<boolean> => {
    const market = getLlamaMarket(marketId)
    if (!hasLeverage(market)) {
      // for simple markets, repay is available if the user has any debt
      const debt = (await market.userState(userAddress))?.debt
      return debt != null && +debt > 0
    }
    return market instanceof LendMarketTemplate
      ? await market.leverage.repayIsAvailable(stateCollateral, userCollateral, userBorrowed, userAddress)
      : market.leverageV2.hasLeverage()
        ? await market.leverageV2.repayIsAvailable(stateCollateral, userCollateral, userBorrowed, userAddress)
        : await market.deleverage.isAvailable(userCollateral, userAddress)
  },
  staleTime: '1m',
  validationSuite: repayValidationSuite({ leverageRequired: false }),
})
