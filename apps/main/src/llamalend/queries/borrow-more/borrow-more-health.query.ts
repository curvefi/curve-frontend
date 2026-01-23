import { getBorrowMoreImplementation } from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import type { BorrowMoreParams, BorrowMoreQuery } from '@/llamalend/queries/validation/borrow-more.validation'
import { borrowMoreValidationSuite } from '@/llamalend/queries/validation/borrow-more.validation'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { Decimal } from '@ui-kit/utils'

export const { useQuery: useBorrowMoreHealth } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    userAddress,
    userCollateral = '0',
    userBorrowed = '0',
    debt = '0',
  }: BorrowMoreParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'borrowMoreHealth',
      { userCollateral },
      { userBorrowed },
      { debt },
    ] as const,
  queryFn: async ({ marketId, userCollateral = '0', userBorrowed = '0', debt = '0' }: BorrowMoreQuery) => {
    const [type, impl] = getBorrowMoreImplementation(marketId, { userCollateral, userBorrowed })
    switch (type) {
      case 'V1':
      case 'V2':
        return (await impl.borrowMoreHealth(userCollateral, userBorrowed, debt)) as Decimal
      case 'unleveraged':
        return (await impl.borrowMoreHealth(userCollateral, debt)) as Decimal
    }
  },
  staleTime: '1m',
  validationSuite: borrowMoreValidationSuite({ leverageRequired: false }),
})
