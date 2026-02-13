import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { Decimal } from '@ui-kit/utils'
import { parseRoute } from '@ui-kit/widgets/RouteProvider'
import { type RepayHealthParams, type RepayHealthQuery } from '../validation/manage-loan.types'
import { repayFromCollateralIsFullValidationSuite } from '../validation/manage-loan.validation'
import { getRepayImplementation } from './repay-query.helpers'

export const { getQueryOptions: getRepayHealthOptions } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    stateCollateral = '0',
    userCollateral = '0',
    userBorrowed = '0',
    userAddress,
    isFull,
    route,
  }: RepayHealthParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'repayHealth',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
      { isFull },
      { route },
    ] as const,
  queryFn: async ({
    marketId,
    stateCollateral,
    userCollateral,
    userBorrowed,
    isFull,
    userAddress,
    route,
  }: RepayHealthQuery) => {
    const [type, impl] = getRepayImplementation(marketId, {
      userCollateral,
      stateCollateral,
      userBorrowed,
      route,
    })
    switch (type) {
      case 'zapV2':
        return (
          await impl.repayExpectedMetrics({
            stateCollateral,
            userCollateral,
            userBorrowed,
            healthIsFull: isFull,
            address: userAddress,
            ...parseRoute(route),
          })
        ).health as Decimal
      case 'V1':
      case 'V2':
        return (await impl.repayHealth(stateCollateral, userCollateral, userBorrowed, isFull)) as Decimal
      case 'deleverage':
        return (await impl.repayHealth(userCollateral, isFull)) as Decimal
      case 'unleveraged':
        return (await impl.repayHealth(userBorrowed, isFull)) as Decimal
    }
  },
  validationSuite: repayFromCollateralIsFullValidationSuite,
})
