import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { type RepayParams, type RepayQuery } from '../validation/manage-loan.types'
import { repayValidationSuite } from '../validation/manage-loan.validation'
import { getRepayImplementation } from './repay-query.helpers'

export const { useQuery: useRepayRouteImage, invalidate: invalidateRepayRouteImage } = queryFactory({
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
      'repayRouteImage',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
      { routeId },
    ] as const,
  queryFn: async ({ marketId, stateCollateral, userCollateral, userBorrowed, routeId }: RepayQuery) => {
    const [type, impl] = getRepayImplementation(marketId, { userCollateral, stateCollateral, userBorrowed, routeId })
    switch (type) {
      case 'V1':
      case 'V2':
        return await impl.repayRouteImage(stateCollateral, userCollateral)
      case 'zapV2':
        return new Error('repayRouteImage is not implemented for zapV2 yet')
      case 'deleverage':
      case 'unleveraged':
        throw new Error('repayRouteImage is not supported for deleverage or unleveraged repay')
    }
  },
  staleTime: '1m',
  validationSuite: repayValidationSuite({ leverageRequired: true }),
})
