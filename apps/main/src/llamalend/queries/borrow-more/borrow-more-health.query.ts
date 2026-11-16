import { getBorrowMoreExpectedCollateralKey } from '@/llamalend/queries/borrow-more/borrow-more-expected-collateral.query'
import {
  getBorrowMoreImplementationArgs,
  isLeverageBorrowMore,
} from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import type { BorrowMoreQuery } from '@/llamalend/queries/validation/borrow-more.validation'
import { borrowMoreValidationSuite } from '@/llamalend/queries/validation/borrow-more.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { notFalsy } from '@primitives/objects.utils'
import { queryFactory } from '@ui/features/queries/factory'
import type { FieldsOf } from '@ui/lib/validation/types'

type BorrowMoreHealthQuery = BorrowMoreQuery & { isFull: boolean }
type BorrowMoreHealthParams = FieldsOf<BorrowMoreHealthQuery>

export const { useQuery: useBorrowMoreHealth, invalidate: invalidateBorrowMoreHealth } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    userAddress,
    userCollateral = '0',
    userBorrowed = '0',
    debt = '0',
    maxDebt,
    leverageEnabled,
    slippage,
    routeId,
    isFull,
  }: BorrowMoreHealthParams) =>
    ({
      name: 'borrowMoreHealth',
      chainId,
      marketId,
      userAddress,
      userCollateral,
      userBorrowed,
      debt,
      maxDebt,
      leverageEnabled,
      slippage,
      routeId,
      isFull,
    }) as const,
  queryFn: async ({
    marketId,
    userCollateral = '0',
    userBorrowed = '0',
    debt = '0',
    leverageEnabled,
    slippage,
    routeId,
    isFull,
  }: BorrowMoreHealthQuery) => {
    const [type, impl, args] = getBorrowMoreImplementationArgs(marketId, {
      userCollateral,
      userBorrowed,
      debt,
      leverageEnabled,
      slippage,
      routeId,
    })
    switch (type) {
      case 'zapV2':
        return (await impl.borrowMoreExpectedMetrics({ ...args[0], healthIsFull: isFull })).health as Decimal
      case 'unleveraged':
        return (await impl.borrowMoreHealth(...args, isFull)) as Decimal
    }
  },
  category: 'llamalend.borrowMore',
  validationSuite: borrowMoreValidationSuite({ debtRequired: true, leverageRequired: false, maxDebtRequired: false }),
  dependencies: params =>
    notFalsy(
      isLeverageBorrowMore(params.marketId, params.leverageEnabled) && getBorrowMoreExpectedCollateralKey(params),
    ),
})
