import { getLoanImplementation } from '@/llamalend/queries/market/market.query-helpers'
import type { RepayParams, RepayQuery } from '@/llamalend/queries/validation/repay.types'
import { repayValidationSuite } from '@/llamalend/queries/validation/repay.validation'
import { queryFactory } from '@ui/features/queries/factory'
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
    userBorrowed = '0',
    userAddress,
    isFull,
    slippage,
    routeId,
  }: RepayParams) =>
    ({
      name: 'repayIsApproved',
      chainId,
      marketId,
      userAddress,
      stateCollateral,
      userBorrowed,
      isFull,
      slippage,
      routeId,
    }) as const,
  queryFn: async ({
    marketId,
    stateCollateral,
    userBorrowed,
    isFull,
    userAddress,
    slippage,
    routeId,
  }: RepayQuery): Promise<boolean> => {
    const useFullRepay = isFullRepayFromDebtToken(isFull, stateCollateral)
    if (useFullRepay) return await getLoanImplementation(marketId).fullRepayIsApproved(userAddress)
    const [type, impl] = getRepayImplementation(marketId, { stateCollateral, userBorrowed, slippage, routeId })
    switch (type) {
      case 'zapV2':
      case 'deleverage':
        return true // no token approval needed, repaying from the position collateral
      case 'unleveragedMint':
        return await impl.repayIsApproved(userBorrowed)
      case 'unleveragedLend':
        return await impl.repayIsApproved(userBorrowed)
    }
  },
  category: 'llamalend.repay',
  validationSuite: repayValidationSuite({ leverageRequired: false, validateMax: false }),
})
