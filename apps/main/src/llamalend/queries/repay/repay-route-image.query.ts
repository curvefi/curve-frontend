import type { RepayQuery, RepayParams } from '@/llamalend/queries/validation/repay.types'
import { repayValidationSuite } from '@/llamalend/queries/validation/repay.validation'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { getRepayImplementation } from './repay-query.helpers'

export const { invalidate: invalidateRepayRouteImage } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    stateCollateral = '0',
    userCollateral = '0',
    debt = '0',
    userAddress,
    slippage,
    routeId,
  }: RepayParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'repayRouteImage',
      { stateCollateral },
      { userCollateral },
      { debt },
      { slippage },
      { routeId },
    ] as const,
  queryFn: async ({ marketId, stateCollateral, userCollateral, debt, slippage, routeId }: RepayQuery) => {
    const [type, impl] = getRepayImplementation(marketId, {
      userCollateral,
      stateCollateral,
      debt,
      slippage,
      routeId,
    })
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
