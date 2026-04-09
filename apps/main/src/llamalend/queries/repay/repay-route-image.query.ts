import type { RepayQuery } from '@/llamalend/queries/validation/repay.types'
import { repayValidationSuite } from '@/llamalend/queries/validation/repay.validation'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { type RepayParams } from '../validation/repay.types'
import { getRepayImplementation } from './repay-query.helpers'

export const {
  useQuery: useRepayRouteImage,
  invalidate: invalidateRepayRouteImage,
  refetchQuery: refetchRepayRouteImage,
} = queryFactory({
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
        return null // todo: get image from api
      case 'deleverage':
      case 'unleveragedLend':
      case 'unleveragedMint':
        throw new Error('repayRouteImage is not supported for deleverage or unleveraged repay')
    }
  },
  category: 'llamalend.repay',
  validationSuite: repayValidationSuite({ leverageRequired: true, validateMax: false }),
})
