import { getBorrowMoreExpectedCollateralKey } from '@/llamalend/queries/borrow-more/borrow-more-expected-collateral.query'
import {
  getBorrowMoreImplementationArgs,
  isLeverageBorrowMore,
} from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
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
    maxDebt,
  }: BorrowMoreParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'borrowMoreHealth',
      { userCollateral },
      { userBorrowed },
      { debt },
      { maxDebt },
    ] as const,
  queryFn: async ({ marketId, userCollateral = '0', userBorrowed = '0', debt = '0' }: BorrowMoreQuery) => {
    const [type, impl, args] = getBorrowMoreImplementationArgs(marketId, { userCollateral, userBorrowed, debt })
    switch (type) {
      case 'V1':
      case 'V2':
        return (await impl.borrowMoreHealth(...args)) as Decimal
      case 'unleveraged':
        return (await impl.borrowMoreHealth(...args)) as Decimal
    }
  },
  staleTime: '1m',
  validationSuite: borrowMoreValidationSuite({ leverageRequired: false }),
  dependencies: (params) => (isLeverageBorrowMore(params.marketId) ? [getBorrowMoreExpectedCollateralKey(params)] : []),
})
