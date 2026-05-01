import { getBorrowMoreImplementationArgs } from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import { useUserCurrentLeverage } from '@/llamalend/queries/user'
import type { BorrowMoreParams, BorrowMoreQuery } from '@/llamalend/queries/validation/borrow-more.validation'
import { borrowMoreLeverageValidationSuite } from '@/llamalend/queries/validation/borrow-more.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { decimal } from '@ui-kit/utils'

/** Query to get expected leverage after borrow more with leverage enabled. */
export const {
  useQuery: useBorrowMoreFutureLeverage,
  invalidate: invalidateBorrowMoreFutureLeverage,
  refetchQuery: refetchBorrowMoreFutureLeverage,
} = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    userAddress,
    userCollateral = '0',
    userBorrowed = '0',
    debt = '0',
    maxDebt,
    slippage,
    leverageEnabled,
    routeId,
  }: BorrowMoreParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'borrowMoreFutureLeverage',
      { userCollateral },
      { userBorrowed },
      { debt },
      { maxDebt },
      { slippage },
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
    slippage,
  }: BorrowMoreQuery): Promise<Decimal | null> => {
    const [type, impl, args] = getBorrowMoreImplementationArgs(marketId, {
      userCollateral,
      userBorrowed,
      debt,
      leverageEnabled,
      routeId,
      slippage,
    })
    switch (type) {
      case 'zapV2':
        return decimal(await impl.borrowMoreFutureLeverage(...args)) ?? null
      case 'V1':
      case 'V2':
        return decimal(await impl.borrowMoreFutureLeverage(...args)) ?? null
      case 'unleveraged':
        throw new Error('Future leverage is not applicable for unleveraged borrow more')
    }
  },
  category: 'llamalend.borrowMore',
  validationSuite: borrowMoreLeverageValidationSuite,
})

export function useBorrowMoreLeverage(params: BorrowMoreParams) {
  const current = useUserCurrentLeverage(params)
  const future = useBorrowMoreFutureLeverage(params)
  return future.data == null ? current : future
}
