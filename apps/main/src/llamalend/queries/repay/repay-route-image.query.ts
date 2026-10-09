import type { RepayQuery, RepayParams } from '@/llamalend/queries/validation/repay.types'
import { repayValidationSuite } from '@/llamalend/queries/validation/repay.validation'
import { queryFactory } from '@ui/features/queries/factory'
import { getRepayImplementation } from './repay-query.helpers'

export const { invalidate: invalidateRepayRouteImage } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    stateCollateral = '0',
    userBorrowed = '0',
    userAddress,
    slippage,
    routeId,
  }: RepayParams) =>
    ({
      name: 'repayRouteImage',
      chainId,
      marketId,
      userAddress,
      stateCollateral,
      userBorrowed,
      slippage,
      routeId,
    }) as const,
  queryFn: ({ marketId, stateCollateral, userBorrowed, slippage, routeId }: RepayQuery) => {
    const [type] = getRepayImplementation(marketId, { stateCollateral, userBorrowed, slippage, routeId })
    switch (type) {
      case 'zapV2':
        return Promise.resolve(null) // todo: get image from api
      case 'deleverage':
      case 'unleveragedLend':
      case 'unleveragedMint':
        throw new Error('repayRouteImage is not supported for deleverage or unleveraged repay')
    }
  },
  category: 'llamalend.repay',
  validationSuite: repayValidationSuite({ leverageRequired: true, validateMax: false }),
})
