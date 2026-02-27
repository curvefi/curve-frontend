import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { type RepayHealthQuery, type RepayHealthParams } from '../validation/manage-loan.types'
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
  }: RepayHealthParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'repayHealth',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
      { isFull },
    ] as const,
  queryFn: async ({ marketId, stateCollateral, userCollateral, userBorrowed, isFull }: RepayHealthQuery) => {
    const [type, impl] = getRepayImplementation(marketId, { userCollateral, stateCollateral, userBorrowed })
    switch (type) {
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
