import { getBorrowMoreImplementation } from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import type { BorrowMoreParams, BorrowMoreQuery } from '@/llamalend/queries/validation/borrow-more.validation'
import { borrowMoreLeverageValidationSuite } from '@/llamalend/queries/validation/borrow-more.validation'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { Decimal } from '@ui-kit/utils'

export const { useQuery: useBorrowMoreExpectedCollateral } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    userAddress,
    userCollateral = '0',
    userBorrowed = '0',
    debt = '0',
    slippage,
  }: BorrowMoreParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'borrowMoreExpectedCollateral',
      { userCollateral },
      { userBorrowed },
      { debt },
      { slippage },
    ] as const,
  queryFn: async ({ marketId, userCollateral = '0', userBorrowed = '0', debt = '0', slippage }: BorrowMoreQuery) => {
    const [type, impl] = getBorrowMoreImplementation(marketId, { userCollateral, userBorrowed })
    if (type === 'unleveraged') throw new Error('Unsupported operation for unleveraged borrow more')
    const {
      userCollateral: newUserCollateral,
      totalCollateral,
      collateralFromUserBorrowed,
      collateralFromDebt,
      avgPrice,
    } = await impl.borrowMoreExpectedCollateral(userCollateral, userBorrowed, debt, +slippage)
    return {
      totalCollateral: totalCollateral as Decimal,
      userCollateral: newUserCollateral as Decimal,
      collateralFromUserBorrowed: collateralFromUserBorrowed as Decimal,
      collateralFromDebt: collateralFromDebt as Decimal,
      avgPrice: avgPrice as Decimal,
    }
  },
  staleTime: '1m',
  validationSuite: borrowMoreLeverageValidationSuite,
})
