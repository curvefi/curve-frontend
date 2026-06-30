import { getBorrowMoreExpectedCollateralKey } from '@/llamalend/queries/borrow-more/borrow-more-expected-collateral.query'
import { getBorrowMoreImplementationArgs } from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import type { BorrowMoreParams, BorrowMoreQuery } from '@/llamalend/queries/validation/borrow-more.validation'
import { borrowMoreLeverageValidationSuite } from '@/llamalend/queries/validation/borrow-more.validation'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { decimal } from '@ui-kit/utils'

export const { useQuery: useBorrowMorePriceImpact, invalidate: invalidateBorrowMorePriceImpact } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    userAddress,
    userBorrowed = '0',
    debt = '0',
    maxDebt,
    leverageEnabled,
    slippage,
    routeId,
  }: BorrowMoreParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'borrowMorePriceImpact',
      { userBorrowed },
      { debt },
      { maxDebt },
      { leverageEnabled },
      { slippage },
      { routeId },
    ] as const,
  queryFn: async ({
    marketId,
    userCollateral = '0',
    userBorrowed = '0',
    debt = '0',
    leverageEnabled,
    slippage,
    routeId,
  }: BorrowMoreQuery) => {
    const [type, impl, args] = getBorrowMoreImplementationArgs(marketId, {
      userCollateral,
      userBorrowed,
      debt,
      leverageEnabled,
      routeId,
      slippage,
    })
    if (type === 'unleveraged') return '0' // there is no price impact, user repays debt directly
    const priceImpact =
      type === 'zapV2'
        ? (await impl.borrowMoreExpectedMetrics(...args)).priceImpact
        : await impl.borrowMorePriceImpact(userBorrowed, debt)
    return decimal(priceImpact) ?? null
  },
  category: 'llamalend.borrowMore',
  validationSuite: borrowMoreLeverageValidationSuite,
  dependencies: params => [getBorrowMoreExpectedCollateralKey(params)],
})
