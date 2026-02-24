import { getBorrowMoreImplementation } from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import type { BorrowMoreParams, BorrowMoreQuery } from '@/llamalend/queries/validation/borrow-more.validation'
import { borrowMoreValidationSuite } from '@/llamalend/queries/validation/borrow-more.validation'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'

export const {
  useQuery: useBorrowMoreIsApproved,
  fetchQuery: fetchBorrowMoreIsApproved,
  invalidate: invalidateBorrowMoreIsApproved,
} = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    userAddress,
    userCollateral = '0',
    userBorrowed = '0',
    maxDebt,
    leverageEnabled,
    routeId,
  }: BorrowMoreParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'borrowMoreIsApproved',
      { userCollateral },
      { userBorrowed },
      { maxDebt },
      { leverageEnabled },
      { routeId },
    ] as const,
  queryFn: async ({ marketId, userCollateral = '0', userBorrowed = '0', leverageEnabled }: BorrowMoreQuery) => {
    const [type, impl] = getBorrowMoreImplementation(marketId, leverageEnabled)
    switch (type) {
      case 'zapV2':
        return await impl.borrowMoreIsApproved({ userCollateral, userBorrowed })
      case 'V1':
      case 'V2':
        return await impl.borrowMoreIsApproved(userCollateral, userBorrowed)
      case 'unleveraged':
        return await impl.borrowMoreIsApproved(userCollateral)
    }
  },
  staleTime: '1m',
  validationSuite: borrowMoreValidationSuite({ leverageRequired: false }),
})
