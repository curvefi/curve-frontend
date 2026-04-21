import type { RepayQuery } from '@/llamalend/queries/validation/repay.types'
import { repayValidationSuite } from '@/llamalend/queries/validation/repay.validation'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { type RepayParams } from '../validation/repay.types'
import { getRepayImplementation, getUserDebtFromQueryCache } from './repay-query.helpers'

export const { useQuery: useRepayIsAvailable, invalidate: invalidateRepayIsAvailable } = queryFactory({
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
      'repayIsAvailable',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
      { slippage },
      { routeId },
    ] as const,
  queryFn: async ({
    chainId,
    marketId,
    stateCollateral,
    userCollateral,
    userBorrowed,
    userAddress,
    slippage,
    routeId,
  }: RepayQuery): Promise<boolean> => {
    const [type, impl, args] = getRepayImplementation(marketId, {
      userCollateral,
      stateCollateral,
      userBorrowed,
      slippage,
      routeId,
    })
    switch (type) {
      case 'zapV2':
        return await impl.repayIsAvailable(...args)
      case 'V1':
      case 'V2':
        return await impl.repayIsAvailable(...args, userAddress)
      case 'deleverage':
        return await impl.isAvailable(...args, userAddress)
      case 'unleveragedMint':
      case 'unleveragedLend':
        // For unleveraged markets, repayment is available when user has debt
        return !!getUserDebtFromQueryCache({ chainId, marketId, userAddress })
    }
  },
  category: 'llamalend.repay',
  validationSuite: repayValidationSuite({ leverageRequired: false, validateMax: false }),
})
