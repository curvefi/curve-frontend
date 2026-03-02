import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { type RepayParams, type RepayQuery } from '../validation/manage-loan.types'
import { repayValidationSuite } from '../validation/manage-loan.validation'
import { getRepayImplementation } from './repay-query.helpers'

export const { useQuery: useRepayRouteImage } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    stateCollateral = '0',
    userCollateral = '0',
    userBorrowed = '0',
    userAddress,
  }: RepayParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'repayRouteImage',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
    ] as const,
  queryFn: async ({ marketId, stateCollateral, userCollateral, userBorrowed }: RepayQuery) => {
    const [type, impl] = getRepayImplementation(marketId, { userCollateral, stateCollateral, userBorrowed })
    switch (type) {
      case 'V1':
      case 'V2':
        return await impl.repayRouteImage(stateCollateral, userCollateral)
      case 'deleverage':
      case 'unleveraged':
        throw new Error('repayRouteImage is not supported for deleverage or unleveraged repay')
    }
  },
  category: 'llamalend.repay',
  validationSuite: repayValidationSuite({ leverageRequired: true }),
})
