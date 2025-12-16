import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { type Decimal } from '@ui-kit/utils'
import { type RepayParams, type RepayQuery } from '../validation/manage-loan.types'
import { repayValidationSuite } from '../validation/manage-loan.validation'

export type RepayExpectedBorrowedResult = {
  totalBorrowed: Decimal
  borrowedFromStateCollateral?: Decimal
  borrowedFromUserCollateral?: Decimal
  userBorrowed?: Decimal
  avgPrice?: Decimal
}

export const { useQuery: useRepayExpectedBorrowed } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    stateCollateral = '0',
    userCollateral = '0',
    userBorrowed = '0',
    userAddress,
    leverageEnabled,
  }: RepayParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'repayExpectedBorrowed',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
      { leverageEnabled },
    ] as const,
  queryFn: async ({ marketId, stateCollateral, userCollateral, userBorrowed }: RepayQuery) => {
    // todo: investigate if this is OK when the user's position is not leveraged
    const market = getLlamaMarket(marketId)
    if (market instanceof LendMarketTemplate) {
      const result = await market.leverage.repayExpectedBorrowed(stateCollateral, userCollateral, userBorrowed)
      return result as RepayExpectedBorrowedResult
    }
    if (market.leverageV2.hasLeverage()) {
      const result = await market.leverageV2.repayExpectedBorrowed(stateCollateral, userCollateral, userBorrowed)
      return result as RepayExpectedBorrowedResult
    }

    console.assert(!+stateCollateral, `Expected 0 stateCollateral for non-leverage market, got ${stateCollateral}`)
    console.assert(!+userBorrowed, `Expected 0 userBorrowed for non-leverage market, got ${userBorrowed}`)
    const { stablecoins, routeIdx } = await market.deleverage.repayStablecoins(userCollateral)
    return { totalBorrowed: stablecoins[routeIdx] as Decimal }
  },
  staleTime: '1m',
  validationSuite: repayValidationSuite({ leverageRequired: true }),
})
