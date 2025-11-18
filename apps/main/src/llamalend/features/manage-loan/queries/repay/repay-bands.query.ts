import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { type RepayFromCollateralParams, type RepayFromCollateralQuery } from '../manage-loan.types'
import { repayFromCollateralValidationSuite } from '../manage-loan.validation'

export const { useQuery: useRepayBands } = queryFactory({
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
      'repayBands',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
    ] as const,
  queryFn: async ({
    marketId,
    stateCollateral,
    userCollateral,
    userBorrowed,
  }: RepayFromCollateralQuery): Promise<[number, number]> => {
    const market = getLlamaMarket(marketId)
    return market instanceof LendMarketTemplate
      ? await market.leverage.repayBands(stateCollateral, userCollateral, userBorrowed)
      : market.leverageV2.hasLeverage()
        ? await market.leverageV2.repayBands(stateCollateral, userCollateral, userBorrowed)
        : await market.deleverage.repayBands(userCollateral)
  },
  validationSuite: repayFromCollateralValidationSuite,
})
