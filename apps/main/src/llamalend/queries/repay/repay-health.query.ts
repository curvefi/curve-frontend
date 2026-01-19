import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { Decimal } from '@ui-kit/utils'
import { type RepayHealthQuery, type RepayHealthParams } from '../validation/manage-loan.types'
import { repayFromCollateralIsFullValidationSuite } from '../validation/manage-loan.validation'
import { getRepayImplementation } from './repay-query.helpers'

export const { useQuery: useRepayHealth } = queryFactory({
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
        return '0' satisfies Decimal // market does not support repay health. TODO: return `null`
    }
  },
  validationSuite: repayFromCollateralIsFullValidationSuite,
})
