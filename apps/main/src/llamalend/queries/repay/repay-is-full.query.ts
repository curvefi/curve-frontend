import { repayExpectedBorrowedQueryKey } from '@/llamalend/queries/repay/repay-expected-borrowed.query'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { type RepayParams, type RepayQuery } from '../validation/manage-loan.types'
import { repayValidationSuite } from '../validation/manage-loan.validation'
import { getRepayImplementation, getUserDebtFromQueryCache } from './repay-query.helpers'

export const { useQuery: useRepayIsFull } = queryFactory({
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
      'repayIsFull',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
    ] as const,
  queryFn: async ({
    chainId,
    marketId,
    stateCollateral,
    userCollateral,
    userBorrowed,
    userAddress,
  }: RepayQuery): Promise<boolean> => {
    const [type, impl] = getRepayImplementation(marketId, { userCollateral, stateCollateral, userBorrowed })
    switch (type) {
      case 'V1':
      case 'V2':
        return await impl.repayIsFull(stateCollateral, userCollateral, userBorrowed, userAddress)
      case 'deleverage':
        return await impl.isFullRepayment(stateCollateral, userAddress)
      case 'unleveraged':
        // For unleveraged markets, full repayment is when userBorrowed >= userDebt
        return +userBorrowed >= getUserDebtFromQueryCache({ chainId, marketId, userAddress })
    }
  },
  category: 'user',
  validationSuite: repayValidationSuite({ leverageRequired: false }),
  dependencies: (params) => [repayExpectedBorrowedQueryKey(params)],
})
