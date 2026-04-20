import { repayExpectedBorrowedQueryKey } from '@/llamalend/queries/repay/repay-expected-borrowed.query'
import type { RepayHealthParams, RepayHealthQuery } from '@/llamalend/queries/validation/repay.types'
import { repayValidationSuite } from '@/llamalend/queries/validation/repay.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { parseRoute } from '@ui-kit/entities/router-api'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { getRepayImplementation } from './repay-query.helpers'

export const { getQueryOptions: getRepayHealthOptions, invalidate: invalidateRepayHealth } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    stateCollateral = '0',
    userCollateral = '0',
    userBorrowed = '0',
    userAddress,
    isHealthFull,
    slippage,
    routeId,
  }: RepayHealthParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'repayHealth',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
      { isHealthFull },
      { slippage },
      { routeId },
    ] as const,
  queryFn: async ({
    marketId,
    stateCollateral,
    userCollateral,
    userBorrowed,
    isHealthFull,
    userAddress,
    slippage,
    routeId,
  }: RepayHealthQuery) => {
    const [type, impl] = getRepayImplementation(marketId, {
      userCollateral,
      stateCollateral,
      userBorrowed,
      routeId,
      slippage,
    })
    switch (type) {
      case 'zapV2':
        return (
          await impl.repayExpectedMetrics({
            stateCollateral,
            userCollateral,
            userBorrowed,
            healthIsFull: isHealthFull,
            address: userAddress,
            ...parseRoute(routeId),
          })
        ).health as Decimal
      case 'V1':
      case 'V2':
        return (await impl.repayHealth(stateCollateral, userCollateral, userBorrowed, isHealthFull)) as Decimal
      case 'deleverage':
        return (await impl.repayHealth(userCollateral, isHealthFull)) as Decimal
      case 'unleveragedMint':
        return (await impl.repayHealth(userBorrowed, isHealthFull)) as Decimal
      case 'unleveragedLend':
        return (await impl.repayHealth({ debt: userBorrowed, full: isHealthFull })) as Decimal
    }
  },
  category: 'llamalend.repay',
  validationSuite: repayValidationSuite({ leverageRequired: false, validateMax: true }),
  dependencies: (params) => [repayExpectedBorrowedQueryKey(params)],
})
