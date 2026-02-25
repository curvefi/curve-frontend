import { getBorrowMoreImplementation } from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import type { BorrowMoreParams, BorrowMoreQuery } from '@/llamalend/queries/validation/borrow-more.validation'
import { borrowMoreValidationGroup } from '@/llamalend/queries/validation/borrow-more.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { createValidationSuite } from '@ui-kit/lib'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { decimal } from '@ui-kit/utils'

export type BorrowMoreMaxReceiveResult = {
  maxDebt: Decimal
  maxTotalCollateral?: Decimal
  userCollateral?: Decimal
  collateralFromUserBorrowed?: Decimal
  collateralFromMaxDebt?: Decimal
  avgPrice?: Decimal
}

export const { useQuery: useBorrowMoreMaxReceive } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    userAddress,
    userCollateral = '0',
    userBorrowed = '0',
    leverageEnabled,
  }: BorrowMoreParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'borrowMoreMaxRecv',
      { userCollateral },
      { userBorrowed },
      { leverageEnabled },
    ] as const,
  queryFn: async ({
    marketId,
    userCollateral = '0',
    userBorrowed = '0',
    leverageEnabled,
  }: BorrowMoreQuery): Promise<BorrowMoreMaxReceiveResult> => {
    const [type, impl] = getBorrowMoreImplementation(marketId, leverageEnabled)
    switch (type) {
      case 'V1':
      case 'V2': {
        const {
          maxDebt,
          maxTotalCollateral,
          userCollateral: userCollateralReceive,
          collateralFromUserBorrowed,
          collateralFromMaxDebt,
          avgPrice,
        } = await impl.borrowMoreMaxRecv(userCollateral, userBorrowed)
        return {
          maxDebt: maxDebt as Decimal,
          maxTotalCollateral: decimal(maxTotalCollateral),
          userCollateral: decimal(userCollateralReceive),
          collateralFromUserBorrowed: decimal(collateralFromUserBorrowed),
          collateralFromMaxDebt: decimal(collateralFromMaxDebt),
          avgPrice: decimal(avgPrice),
        }
      }
      case 'unleveraged':
        return { maxDebt: (await impl.borrowMoreMaxRecv(userCollateral)) as Decimal }
    }
  },
  staleTime: '1m',
  validationSuite: createValidationSuite((params: BorrowMoreParams) =>
    borrowMoreValidationGroup(params, {
      leverageRequired: false,
      debtRequired: false,
      maxDebtRequired: false,
    }),
  ),
})
