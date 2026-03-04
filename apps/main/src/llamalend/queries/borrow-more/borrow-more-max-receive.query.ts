import { getBorrowMoreImplementation } from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import type { BorrowMoreParams, BorrowMoreQuery } from '@/llamalend/queries/validation/borrow-more.validation'
import { borrowMoreValidationGroup } from '@/llamalend/queries/validation/borrow-more.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { getExpectedFn, getRouteById } from '@ui-kit/entities/router-api'
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

function castFieldsToDecimal(foo: {
  maxDebt: string
  maxTotalCollateral: string
  userCollateral: string
  collateralFromUserBorrowed: string
  collateralFromMaxDebt: string
  avgPrice: string
}) {
  const {
    maxDebt,
    maxTotalCollateral,
    userCollateral: userCollateralReceive,
    collateralFromUserBorrowed,
    collateralFromMaxDebt,
    avgPrice,
  } = foo
  return {
    maxDebt: maxDebt as Decimal,
    maxTotalCollateral: decimal(maxTotalCollateral),
    userCollateral: decimal(userCollateralReceive),
    collateralFromUserBorrowed: decimal(collateralFromUserBorrowed),
    collateralFromMaxDebt: decimal(collateralFromMaxDebt),
    avgPrice: decimal(avgPrice),
  }
}

export const { useQuery: useBorrowMoreMaxReceive, invalidate: invalidateBorrowMoreMaxReceive } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    userAddress,
    userCollateral = '0',
    userBorrowed = '0',
    leverageEnabled,
    routeId,
    slippage,
  }: BorrowMoreParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'borrowMoreMaxRecv',
      { userCollateral },
      { userBorrowed },
      { leverageEnabled },
      { routeId },
      { slippage },
    ] as const,
  queryFn: async ({
    marketId,
    userCollateral = '0',
    userBorrowed = '0',
    leverageEnabled,
    chainId,
    routeId,
    userAddress,
    slippage,
  }: BorrowMoreQuery): Promise<BorrowMoreMaxReceiveResult> => {
    const [type, impl] = getBorrowMoreImplementation(marketId, leverageEnabled)
    switch (type) {
      case 'zapV2': {
        const { router } = getRouteById(routeId)
        return castFieldsToDecimal(
          await impl.borrowMoreMaxRecv({
            userCollateral,
            userBorrowed,
            address: userAddress,
            getExpected: getExpectedFn({ chainId, router, userAddress, slippage }),
          }),
        )
      }
      case 'V1':
      case 'V2':
        return castFieldsToDecimal(await impl.borrowMoreMaxRecv(userCollateral, userBorrowed))
      case 'unleveraged':
        return { maxDebt: (await impl.borrowMoreMaxRecv(userCollateral)) as Decimal }
    }
  },
  category: 'llamalend.borrowMore',
  validationSuite: createValidationSuite((params: BorrowMoreParams) =>
    borrowMoreValidationGroup(params, {
      leverageRequired: false,
      debtRequired: false,
      maxDebtRequired: false,
    }),
  ),
})
