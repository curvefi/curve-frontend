import { getBorrowMoreImplementationArgs } from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import type { BorrowMoreParams, BorrowMoreQuery } from '@/llamalend/queries/validation/borrow-more.validation'
import { borrowMoreLeverageValidationSuite } from '@/llamalend/queries/validation/borrow-more.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'

export const { useQuery: useBorrowMoreExpectedCollateral, queryKey: getBorrowMoreExpectedCollateralKey } = queryFactory(
  {
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
    }: BorrowMoreParams) =>
      [
        ...rootKeys.userMarket({ chainId, marketId, userAddress }),
        'borrowMoreExpectedCollateral',
        { userCollateral },
        { userBorrowed },
        { debt },
        { maxDebt },
        { slippage },
        { leverageEnabled },
      ] as const,
    queryFn: async ({
      marketId,
      userCollateral = '0',
      userBorrowed = '0',
      debt = '0',
      slippage,
      leverageEnabled,
    }: BorrowMoreQuery) => {
      const [type, impl, args] = getBorrowMoreImplementationArgs(marketId, {
        userCollateral,
        userBorrowed,
        debt,
        leverageEnabled,
      })
      if (type === 'unleveraged') throw new Error('Unsupported operation for unleveraged borrow more')
      const {
        userCollateral: newUserCollateral,
        totalCollateral,
        collateralFromUserBorrowed,
        collateralFromDebt,
        avgPrice,
      } = await impl.borrowMoreExpectedCollateral(...args, +slippage)
      return {
        totalCollateral: totalCollateral as Decimal,
        userCollateral: newUserCollateral as Decimal,
        collateralFromUserBorrowed: collateralFromUserBorrowed as Decimal,
        collateralFromDebt: collateralFromDebt as Decimal,
        avgPrice: avgPrice as Decimal,
      }
    },
    category: 'llamalend.borrowMore',
    validationSuite: borrowMoreLeverageValidationSuite,
  },
)
