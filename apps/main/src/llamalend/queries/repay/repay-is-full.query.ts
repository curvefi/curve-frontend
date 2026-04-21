import { repayExpectedBorrowedQueryKey } from '@/llamalend/queries/repay/repay-expected-borrowed.query'
import type { RepayQuery } from '@/llamalend/queries/validation/repay.types'
import { repayValidationSuite } from '@/llamalend/queries/validation/repay.validation'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { type RepayParams } from '../validation/repay.types'
import { getRepayImplementation, getUserDebtFromQueryCache } from './repay-query.helpers'

/** Returns whether the planned repay fully closes the loan, whether repayment comes from debt token, wallet collateral, or position collateral. */
export const { useQuery: useRepayIsFull, invalidate: invalidateRepayIsFull } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    stateCollateral = '0',
    userCollateral = '0',
    userBorrowed = '0',
    userAddress,
    slippage,
    routeId,
  }: RepayParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'repayIsFull',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
      { slippage },
      { routeId },
    ] as const,
  queryFn: async ({
    chainId,
    marketId,
    stateCollateral,
    userCollateral,
    userBorrowed,
    userAddress,
    slippage,
    routeId,
  }: RepayQuery): Promise<boolean> => {
    const [type, impl, args] = getRepayImplementation(marketId, {
      userCollateral,
      stateCollateral,
      userBorrowed,
      slippage,
      routeId,
    })
    switch (type) {
      case 'zapV2':
        return await impl.repayIsFull(...args)
      case 'V1':
      case 'V2':
        return await impl.repayIsFull(...args, userAddress)
      case 'deleverage':
        return await impl.isFullRepayment(...args, userAddress)
      case 'unleveragedLend':
      case 'unleveragedMint':
        // For unleveraged markets, full repayment is when userBorrowed >= userDebt
        return +userBorrowed >= getUserDebtFromQueryCache({ chainId, marketId, userAddress })
    }
  },
  category: 'llamalend.repay',
  validationSuite: repayValidationSuite({ leverageRequired: false, validateMax: false }),
  dependencies: (params) => [repayExpectedBorrowedQueryKey(params)],
})
