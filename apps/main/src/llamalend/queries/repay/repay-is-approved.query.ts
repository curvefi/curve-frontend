import { getLoanImplementation } from '@/llamalend/queries/market/market.query-helpers'
import type { RepayParams, RepayQuery } from '@/llamalend/queries/validation/repay.types'
import { repayValidationSuite } from '@/llamalend/queries/validation/repay.validation'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { getRepayImplementation, isFullRepayFromDebtToken } from './repay-query.helpers'

export type RepayIsApprovedParams<ChainId = IChainId> = RepayParams

export const {
  useQuery: useRepayIsApproved,
  fetchQuery: fetchRepayIsApproved,
  invalidate: invalidateRepayIsApproved,
  refetchQuery: refetchRepayIsApproved,
} = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    stateCollateral = '0',
    userCollateral = '0',
    userBorrowed = '0',
    userAddress,
    isFull,
    routeId,
  }: RepayIsApprovedParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'repayIsApproved',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
      { isFull },
      { routeId },
    ] as const,
  queryFn: async ({
    marketId,
    stateCollateral,
    userCollateral,
    userBorrowed,
    isFull,
    userAddress,
    routeId,
  }: RepayQuery): Promise<boolean> => {
    const useFullRepay = isFullRepayFromDebtToken(isFull, stateCollateral, userCollateral)
    if (useFullRepay) return await getLoanImplementation(marketId).fullRepayIsApproved(userAddress)
    const [type, impl] = getRepayImplementation(marketId, { userCollateral, stateCollateral, userBorrowed, routeId })
    switch (type) {
      case 'zapV2':
        return await impl.repayIsApproved({ userCollateral, userBorrowed })
      case 'V1':
      case 'V2':
        return await impl.repayIsApproved(userCollateral, userBorrowed)
      case 'deleverage':
        return true // deleverage query doesn't need approval because it only uses the user stateCollateral
      case 'unleveragedMint':
        return await impl.repayIsApproved(userBorrowed)
      case 'unleveragedLend':
        return await impl.repayIsApproved(userBorrowed)
    }
  },
  category: 'llamalend.repay',
  validationSuite: repayValidationSuite({ leverageRequired: false, validateMax: false }),
})
