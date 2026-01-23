import { getBorrowMoreImplementation } from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import type { BorrowMoreParams, BorrowMoreQuery } from '@/llamalend/queries/validation/borrow-more.validation'
import { borrowMoreValidationSuite } from '@/llamalend/queries/validation/borrow-more.validation'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { decimal, Decimal } from '@ui-kit/utils'

export type BorrowMoreMaxReceiveResult = {
  maxDebt: Decimal
  maxTotalCollateral?: Decimal
  userCollateral?: Decimal
  collateralFromUserBorrowed?: Decimal
  collateralFromMaxDebt?: Decimal
  avgPrice?: Decimal
}

export const { useQuery: useBorrowMoreMaxReceive } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, userCollateral = '0', userBorrowed = '0' }: BorrowMoreParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'borrowMoreMaxRecv',
      { userCollateral },
      { userBorrowed },
    ] as const,
  queryFn: async ({
    marketId,
    userCollateral = '0',
    userBorrowed = '0',
  }: BorrowMoreQuery): Promise<BorrowMoreMaxReceiveResult> => {
    const [type, impl] = getBorrowMoreImplementation(marketId, { userCollateral, userBorrowed })
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
  validationSuite: borrowMoreValidationSuite({ leverageRequired: false }),
})
