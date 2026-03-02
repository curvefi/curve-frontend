import { repayExpectedBorrowedQueryKey } from '@/llamalend/queries/repay/repay-expected-borrowed.query'
import type { Decimal } from '@primitives/decimal.utils'
import { parseRoute } from '@ui-kit/entities/router-api'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { type Range } from '@ui-kit/types/util'
import { type RepayParams, type RepayQuery } from '../validation/manage-loan.types'
import { repayValidationSuite } from '../validation/manage-loan.validation'
import { getRepayImplementation } from './repay-query.helpers'

export const { useQuery: useRepayPrices, invalidate: invalidateRepayPrices } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    stateCollateral = '0',
    userCollateral = '0',
    userBorrowed = '0',
    userAddress,
    routeId,
  }: RepayParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'repayPrices',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
      { routeId },
    ] as const,
  queryFn: async ({ marketId, stateCollateral, userCollateral, userBorrowed, routeId, userAddress }: RepayQuery) => {
    const [type, impl, args] = getRepayImplementation(marketId, {
      userCollateral,
      stateCollateral,
      userBorrowed,
      routeId,
    })
    // it looks like all implementations have the same signature, but `args` is typed differently for each
    switch (type) {
      case 'zapV2':
        return (
          await impl.repayExpectedMetrics({
            stateCollateral,
            userCollateral,
            userBorrowed,
            healthIsFull: true,
            address: userAddress,
            ...parseRoute(routeId),
          })
        ).prices as Range<Decimal>
      case 'V1':
      case 'V2':
        return (await impl.repayPrices(...args)) as Range<Decimal>
      case 'deleverage':
        return (await impl.repayPrices(...args)) as Range<Decimal>
      case 'unleveraged':
        return (await impl.repayPrices(...args)) as Range<Decimal>
    }
  },
  validationSuite: repayValidationSuite({ leverageRequired: false }),
  dependencies: (params) => [repayExpectedBorrowedQueryKey(params)],
})
