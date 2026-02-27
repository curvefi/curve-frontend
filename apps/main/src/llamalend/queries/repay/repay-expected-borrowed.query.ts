import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { decimal } from '@ui-kit/utils'
import { type RepayParams, type RepayQuery } from '../validation/manage-loan.types'
import { repayValidationSuite } from '../validation/manage-loan.validation'
import { getRepayImplementation, getUserDebtFromQueryCache } from './repay-query.helpers'

export type RepayExpectedBorrowedResult = {
  totalBorrowed: Decimal
  borrowedFromStateCollateral?: Decimal
  borrowedFromUserCollateral?: Decimal
  userBorrowed?: Decimal
  avgPrice?: Decimal
}

export const { useQuery: useRepayExpectedBorrowed, queryKey: repayExpectedBorrowedQueryKey } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    stateCollateral = '0',
    userCollateral = '0',
    userBorrowed = '0',
    userAddress,
    slippage,
  }: RepayParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'repayExpectedBorrowed',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
      { slippage },
    ] as const,
  queryFn: async ({
    chainId,
    marketId,
    userAddress,
    stateCollateral,
    userCollateral,
    userBorrowed,
    slippage,
  }: RepayQuery) => {
    const [type, impl, args] = getRepayImplementation(marketId, { userCollateral, stateCollateral, userBorrowed })
    switch (type) {
      case 'V1':
      case 'V2':
        return (await impl.repayExpectedBorrowed(...args, +slippage)) as RepayExpectedBorrowedResult
      case 'deleverage': {
        const { stablecoins, routeIdx } = await impl.repayStablecoins(...args)
        return { totalBorrowed: stablecoins[routeIdx] as Decimal }
      }
      case 'unleveraged':
        return {
          totalBorrowed: decimal(getUserDebtFromQueryCache({ chainId, marketId, userAddress }) - +userBorrowed)!,
        }
    }
  },
  category: 'user',
  validationSuite: repayValidationSuite({ leverageRequired: false }),
})
