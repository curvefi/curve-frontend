import { repayExpectedBorrowedQueryKey } from '@/llamalend/queries/repay/repay-expected-borrowed.query'
import type { RepayHealthParams, RepayHealthQuery } from '@/llamalend/queries/validation/repay.types'
import { repayValidationSuite } from '@/llamalend/queries/validation/repay.validation'
import { parseRoute } from '@evm-ui/queries/router-api'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { getRepayImplementation, NO_USER_COLLATERAL } from './repay-query.helpers'

export const { getQueryOptions: getRepayHealthOptions, invalidate: invalidateRepayHealth } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    stateCollateral = '0',
    userBorrowed = '0',
    userAddress,
    isHealthFull,
    slippage,
    routeId,
  }: RepayHealthParams) =>
    ({
      name: 'repayHealth',
      chainId,
      marketId,
      userAddress,
      stateCollateral,
      userBorrowed,
      isHealthFull,
      slippage,
      routeId,
    }) as const,
  queryFn: async ({
    marketId,
    stateCollateral,
    userBorrowed,
    isHealthFull,
    userAddress,
    slippage,
    routeId,
  }: RepayHealthQuery) => {
    const [type, impl] = getRepayImplementation(marketId, { stateCollateral, userBorrowed, routeId, slippage })
    switch (type) {
      case 'zapV2':
        return (
          await impl.repayExpectedMetrics({
            stateCollateral,
            ...NO_USER_COLLATERAL,
            healthIsFull: isHealthFull,
            address: userAddress,
            ...parseRoute(routeId),
          })
        ).health as Decimal
      case 'deleverage':
        return (await impl.repayHealth(stateCollateral, isHealthFull)) as Decimal
      case 'unleveragedMint':
        return (await impl.repayHealth(userBorrowed, isHealthFull)) as Decimal
      case 'unleveragedLend':
        return (await impl.repayHealth({ debt: userBorrowed, full: isHealthFull })) as Decimal
    }
  },
  category: 'llamalend.repay',
  validationSuite: repayValidationSuite({ leverageRequired: false, validateMax: false }),
  dependencies: params => [repayExpectedBorrowedQueryKey(params)],
})
