import { getBorrowMoreExpectedCollateralKey } from '@/llamalend/queries/borrow-more/borrow-more-expected-collateral.query'
import {
  getBorrowMoreImplementationArgs,
  isLeverageBorrowMore,
} from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import type { BorrowMoreParams, BorrowMoreQuery } from '@/llamalend/queries/validation/borrow-more.validation'
import { borrowMoreValidationSuite } from '@/llamalend/queries/validation/borrow-more.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'

export const { useQuery: useBorrowMoreHealth } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    userAddress,
    userCollateral = '0',
    userBorrowed = '0',
    debt = '0',
    maxDebt,
    leverageEnabled,
  }: BorrowMoreParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'borrowMoreHealth',
      { userCollateral },
      { userBorrowed },
      { debt },
      { maxDebt },
      { leverageEnabled },
    ] as const,
  queryFn: async ({
    marketId,
    userCollateral = '0',
    userBorrowed = '0',
    debt = '0',
    leverageEnabled,
  }: BorrowMoreQuery) => {
    const [type, impl, args] = getBorrowMoreImplementationArgs(marketId, {
      userCollateral,
      userBorrowed,
      debt,
      leverageEnabled,
    })
    switch (type) {
      case 'V1':
      case 'V2':
        return (await impl.borrowMoreHealth(...args)) as Decimal
      case 'unleveraged':
        return (await impl.borrowMoreHealth(...args)) as Decimal
    }
  },
  staleTime: '1m',
  validationSuite: borrowMoreValidationSuite({ debtRequired: true, leverageRequired: false }),
  dependencies: (params) =>
    isLeverageBorrowMore(params.marketId, params.leverageEnabled) ? [getBorrowMoreExpectedCollateralKey(params)] : [],
})
