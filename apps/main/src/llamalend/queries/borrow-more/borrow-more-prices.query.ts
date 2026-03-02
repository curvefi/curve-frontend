import { getBorrowMoreExpectedCollateralKey } from '@/llamalend/queries/borrow-more/borrow-more-expected-collateral.query'
import { getBorrowMoreImplementationArgs } from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import type { BorrowMoreParams, BorrowMoreQuery } from '@/llamalend/queries/validation/borrow-more.validation'
import { borrowMoreValidationSuite } from '@/llamalend/queries/validation/borrow-more.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { Range } from '@ui-kit/types/util'

export const { useQuery: useBorrowMorePrices, invalidate: invalidateBorrowMorePrices } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    userAddress,
    userCollateral = '0',
    userBorrowed = '0',
    debt = '0',
    maxDebt,
    leverageEnabled,
    routeId,
  }: BorrowMoreParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'borrowMorePrices',
      { userCollateral },
      { userBorrowed },
      { debt },
      { maxDebt },
      { leverageEnabled },
      { routeId },
    ] as const,
  queryFn: async ({
    marketId,
    userCollateral = '0',
    userBorrowed = '0',
    debt = '0',
    leverageEnabled,
    routeId,
  }: BorrowMoreQuery) => {
    const [type, impl, args] = getBorrowMoreImplementationArgs(marketId, {
      userCollateral,
      userBorrowed,
      debt,
      leverageEnabled,
      routeId,
    })
    switch (type) {
      case 'zapV2':
        return (await impl.borrowMoreExpectedMetrics(...args)).prices as Range<Decimal>
      case 'V1':
      case 'V2':
        return (await impl.borrowMorePrices(...args)) as Range<Decimal>
      case 'unleveraged':
        return (await impl.borrowMorePrices(...args)) as Range<Decimal>
    }
  },
  staleTime: '1m',
  validationSuite: borrowMoreValidationSuite({ leverageRequired: false, debtRequired: true }),
  dependencies: (params) => (params.leverageEnabled ? [getBorrowMoreExpectedCollateralKey(params)] : []),
})
