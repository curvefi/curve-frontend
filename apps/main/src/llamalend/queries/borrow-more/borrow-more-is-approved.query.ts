import { getBorrowMoreImplementation } from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import type { BorrowMoreParams, BorrowMoreQuery } from '@/llamalend/queries/validation/borrow-more.validation'
import { borrowMoreValidationSuite } from '@/llamalend/queries/validation/borrow-more.validation'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'

export const { useQuery: useBorrowMoreIsApproved, fetchQuery: fetchBorrowMoreIsApproved } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, userCollateral = '0', userBorrowed = '0' }: BorrowMoreParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'borrowMoreIsApproved',
      { userCollateral },
      { userBorrowed },
    ] as const,
  queryFn: async ({ marketId, userCollateral = '0', userBorrowed = '0' }: BorrowMoreQuery) => {
    const [type, impl] = getBorrowMoreImplementation(marketId)
    switch (type) {
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
