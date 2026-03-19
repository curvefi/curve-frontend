import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { decimal } from '@ui-kit/utils'
import type { RepayParams, RepayQuery } from '../validation/manage-loan.types'
import { repayValidationSuite } from '../validation/manage-loan.validation'
import { getRepayImplementation } from './repay-query.helpers'

export const {
  useQuery: useRepayFutureLeverage,
  invalidate: invalidateRepayFutureLeverage,
  refetchQuery: refetchRepayFutureLeverage,
} = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    stateCollateral = '0',
    userCollateral = '0',
    userBorrowed = '0',
    userAddress,
    slippage,
    routeId,
  }: RepayParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'repayFutureLeverage',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
      { slippage },
      { routeId },
    ] as const,
  queryFn: async ({
    marketId,
    userAddress,
    stateCollateral,
    userCollateral,
    userBorrowed,
    slippage,
    routeId,
  }: RepayQuery) => {
    const [type, impl, args] = getRepayImplementation(marketId, {
      userCollateral,
      stateCollateral,
      userBorrowed,
      routeId,
      slippage,
    })
    switch (type) {
      case 'zapV2':
        return decimal(await impl.repayFutureLeverage(...args)) ?? null
      case 'V1':
      case 'V2':
        return decimal(await impl.repayFutureLeverage(...args, userAddress)) ?? null
      case 'unleveraged':
        return decimal(await impl.repayFutureLeverage(...args, userAddress)) ?? null
      case 'deleverage':
        throw new Error('Future leverage is not available for deleverage repay')
    }
  },
  category: 'llamalend.repay',
  validationSuite: repayValidationSuite({ leverageRequired: false }),
})
