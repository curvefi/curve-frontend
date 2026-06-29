import { getLoanImplementation } from '@/llamalend/queries/market/market.query-helpers'
import type { RepayParams, RepayQuery } from '@/llamalend/queries/validation/repay.types'
import { repayValidationSuite } from '@/llamalend/queries/validation/repay.validation'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { getRepayImplementation, isFullRepayFromDebtToken } from './repay-query.helpers'

export const {
  useQuery: useRepayIsApproved,
  fetchQuery: fetchRepayIsApproved,
  invalidate: invalidateRepayIsApproved,
} = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    stateCollateral = '0',
    userCollateral = '0',
    debt = '0',
    userAddress,
    isFull,
    slippage,
    routeId,
  }: RepayParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'repayIsApproved',
      { stateCollateral },
      { userCollateral },
      { debt },
      { isFull },
      { slippage },
      { routeId },
    ] as const,
  queryFn: async ({
    marketId,
    stateCollateral,
    userCollateral,
    debt,
    isFull,
    userAddress,
    slippage,
    routeId,
  }: RepayQuery): Promise<boolean> => {
    const useFullRepay = isFullRepayFromDebtToken(isFull, stateCollateral, userCollateral)
    if (useFullRepay) return await getLoanImplementation(marketId).fullRepayIsApproved(userAddress)
    const [type, impl] = getRepayImplementation(marketId, {
      userCollateral,
      stateCollateral,
      debt,
      slippage,
      routeId,
    })
    switch (type) {
      case 'zapV2':
        return await impl.repayIsApproved({ userCollateral })
      case 'V1':
      case 'V2':
        return await impl.repayIsApproved(userCollateral, debt)
      case 'deleverage':
        return true // deleverage query doesn't need approval because it only uses the user stateCollateral
      case 'unleveragedMint':
        return await impl.repayIsApproved(debt)
      case 'unleveragedLend':
        return await impl.repayIsApproved(debt)
    }
  },
  category: 'llamalend.repay',
  validationSuite: repayValidationSuite({ leverageRequired: false, validateMax: false }),
})
