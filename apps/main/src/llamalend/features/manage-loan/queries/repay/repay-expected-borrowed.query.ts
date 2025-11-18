import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { type Decimal } from '@ui-kit/utils'
import { type RepayFromCollateralParams, type RepayFromCollateralQuery } from '../manage-loan.types'
import { repayFromCollateralValidationSuite } from '../manage-loan.validation'

type RepayExpectedBorrowedResult = {
  totalBorrowed: Decimal
  borrowedFromStateCollateral: Decimal
  borrowedFromUserCollateral: Decimal
  userBorrowed: Decimal
  avgPrice: Decimal
}

export const { useQuery: useRepayExpectedBorrowed } = queryFactory({
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
      'repayExpectedBorrowed',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
    ] as const,
  queryFn: async ({ marketId, stateCollateral, userCollateral, userBorrowed }: RepayFromCollateralQuery) => {
    const market = getLlamaMarket(marketId)
    return market instanceof LendMarketTemplate
      ? ((await market.leverage.repayExpectedBorrowed(
          stateCollateral,
          userCollateral,
          userBorrowed,
        )) as RepayExpectedBorrowedResult)
      : market.leverageV2.hasLeverage()
        ? ((await market.leverageV2.repayExpectedBorrowed(
            stateCollateral,
            userCollateral,
            userBorrowed,
          )) as RepayExpectedBorrowedResult)
        : null
  },
  staleTime: '1m',
  validationSuite: repayFromCollateralValidationSuite,
})
