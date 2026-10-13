import { repayExpectedBorrowedQueryKey } from '@/llamalend/queries/repay/repay-expected-borrowed.query'
import { getUserStateKey } from '@/llamalend/queries/user/user-state.query'
import type { RepayQuery, RepayParams } from '@/llamalend/queries/validation/repay.types'
import { repayValidationSuite } from '@/llamalend/queries/validation/repay.validation'
import { queryFactory } from '@ui/features/queries/factory'
import { getRepayImplementation, getUserDebtFromQueryCache } from './repay-query.helpers'

/** Returns whether the planned repay fully closes the loan, whether repayment comes from debt token or position collateral. */
export const { useQuery: useRepayIsFull, invalidate: invalidateRepayIsFull } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    stateCollateral = '0',
    userBorrowed = '0',
    userAddress,
    slippage,
    routeId,
  }: RepayParams) =>
    ({
      name: 'repayIsFull',
      chainId,
      marketId,
      userAddress,
      stateCollateral,
      userBorrowed,
      slippage,
      routeId,
    }) as const,
  queryFn: async ({
    chainId,
    marketId,
    stateCollateral,
    userBorrowed,
    userAddress,
    slippage,
    routeId,
  }: RepayQuery): Promise<boolean> => {
    const [type, impl, args] = getRepayImplementation(marketId, { stateCollateral, userBorrowed, slippage, routeId })
    switch (type) {
      case 'zapV2':
        return await impl.repayIsFull(...args)
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
  dependencies: params => [getUserStateKey(params), repayExpectedBorrowedQueryKey(params)],
})
