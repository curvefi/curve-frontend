import { getBorrowMoreImplementationArgs } from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import type { BorrowMoreParams, BorrowMoreQuery } from '@/llamalend/queries/validation/borrow-more.validation'
import { borrowMoreLeverageValidationSuite } from '@/llamalend/queries/validation/borrow-more.validation'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { Decimal } from '@ui-kit/utils'

const castFieldsToDecimal = ({
  userCollateral: newUserCollateral,
  totalCollateral,
  collateralFromUserBorrowed,
  collateralFromDebt,
  avgPrice,
}: {
  totalCollateral: string
  userCollateral: string
  collateralFromUserBorrowed: string
  collateralFromDebt: string
  avgPrice: string
}) => ({
  totalCollateral: totalCollateral as Decimal,
  userCollateral: newUserCollateral as Decimal,
  collateralFromUserBorrowed: collateralFromUserBorrowed as Decimal,
  collateralFromDebt: collateralFromDebt as Decimal,
  avgPrice: avgPrice as Decimal,
})

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
      route,
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
        { route },
      ] as const,
    queryFn: async ({
      marketId,
      userCollateral = '0',
      userBorrowed = '0',
      debt = '0',
      slippage,
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
      if (type === 'unleveraged') throw new Error('Unsupported operation for unleveraged borrow more')
      return type == 'zapV2'
        ? castFieldsToDecimal(await impl.borrowMoreExpectedCollateral(...args))
        : castFieldsToDecimal(await impl.borrowMoreExpectedCollateral(...args, +slippage))
    },
    staleTime: '1m',
    validationSuite: borrowMoreLeverageValidationSuite,
  },
)
