import { getBorrowMoreExpectedCollateralKey } from '@/llamalend/queries/borrow-more/borrow-more-expected-collateral.query'
import { getBorrowMoreImplementationArgs } from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import type { BorrowMoreParams, BorrowMoreQuery } from '@/llamalend/queries/validation/borrow-more.validation'
import { borrowMoreValidationSuite } from '@/llamalend/queries/validation/borrow-more.validation'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { Decimal } from '@ui-kit/utils'

export const { useQuery: useBorrowMorePrices } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    userAddress,
    userCollateral = '0',
    userBorrowed = '0',
    debt = '0',
    maxDebt,
    leverageEnabled,
    route,
  }: BorrowMoreParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'borrowMorePrices',
      { userCollateral },
      { userBorrowed },
      { debt },
      { maxDebt },
      { leverageEnabled },
      { route },
    ] as const,
  queryFn: async ({
    marketId,
    userCollateral = '0',
    userBorrowed = '0',
    debt = '0',
    leverageEnabled,
    route,
  }: BorrowMoreQuery) => {
    const [type, impl, args] = getBorrowMoreImplementationArgs(marketId, {
      userCollateral,
      userBorrowed,
      debt,
      leverageEnabled,
      route,
    })
    switch (type) {
      case 'zapV2':
        return (await impl.borrowMoreExpectedMetrics(...args)).prices as Decimal[]
      case 'V1':
      case 'V2':
        return (await impl.borrowMorePrices(...args)) as Decimal[]
      case 'unleveraged':
        return (await impl.borrowMorePrices(...args)) as Decimal[]
    }
  },
  staleTime: '1m',
  validationSuite: borrowMoreValidationSuite({ leverageRequired: false, debtRequired: true }),
  dependencies: (params) => [getBorrowMoreExpectedCollateralKey(params)],
})
