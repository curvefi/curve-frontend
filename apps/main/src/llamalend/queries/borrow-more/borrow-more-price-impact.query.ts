import { getBorrowMoreExpectedCollateralKey } from '@/llamalend/queries/borrow-more/borrow-more-expected-collateral.query'
import { getBorrowMoreImplementation } from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import type { BorrowMoreParams, BorrowMoreQuery } from '@/llamalend/queries/validation/borrow-more.validation'
import { borrowMoreLeverageValidationSuite } from '@/llamalend/queries/validation/borrow-more.validation'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'

export const { useQuery: useBorrowMorePriceImpact } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    userAddress,
    userBorrowed = '0',
    debt = '0',
    maxDebt,
    leverageEnabled,
  }: BorrowMoreParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'borrowMorePriceImpact',
      { userBorrowed },
      { debt },
      { maxDebt },
      { leverageEnabled },
    ] as const,
  queryFn: async ({ marketId, userBorrowed = '0', debt = '0', leverageEnabled }: BorrowMoreQuery) => {
    const [type, impl] = getBorrowMoreImplementation(marketId, leverageEnabled)
    if (type === 'unleveraged') throw new Error('Price impact is not applicable for unleveraged borrow more')
    return +(await impl.borrowMorePriceImpact(userBorrowed, debt))
  },
  staleTime: '1m',
  validationSuite: borrowMoreLeverageValidationSuite,
  dependencies: (params) => [getBorrowMoreExpectedCollateralKey(params)],
})
