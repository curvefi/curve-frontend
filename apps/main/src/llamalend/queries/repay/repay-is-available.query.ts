import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { type RepayFromCollateralParams, type RepayFromCollateralQuery } from '../validation/manage-loan.types'
import { repayFromCollateralValidationSuite } from '../validation/manage-loan.validation'

export const { useQuery: useRepayIsAvailable } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    stateCollateral = '0',
    userCollateral = '0',
    userBorrowed = '0',
    userAddress,
  }: RepayFromCollateralParams) =>
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
  }: RepayFromCollateralQuery): Promise<boolean> => {
    const market = getLlamaMarket(marketId)
    return market instanceof LendMarketTemplate
      ? await market.leverage.repayIsAvailable(stateCollateral, userCollateral, userBorrowed, userAddress)
      : market.leverageV2.hasLeverage()
        ? await market.leverageV2.repayIsAvailable(stateCollateral, userCollateral, userBorrowed, userAddress)
        : await market.deleverage.isAvailable(userCollateral, userAddress)
  },
  staleTime: '1m',
  validationSuite: repayFromCollateralValidationSuite,
})
