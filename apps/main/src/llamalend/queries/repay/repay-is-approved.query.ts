import { getLlamaMarket } from '@/llamalend/llama.utils'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { type RepayIsFullParams, type RepayIsFullQuery } from '../validation/manage-loan.types'
import { repayFromCollateralIsFullValidationSuite } from '../validation/manage-loan.validation'
import { getRepayImplementation } from './repay-query.helpers'

export type RepayIsApprovedParams<ChainId = IChainId> = RepayIsFullParams<ChainId>

export const { useQuery: useRepayIsApproved, fetchQuery: fetchRepayIsApproved } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    stateCollateral = '0',
    userCollateral = '0',
    userBorrowed = '0',
    userAddress,
    isFull,
  }: RepayIsApprovedParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'repayIsApproved',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
      { isFull },
    ] as const,
  queryFn: async ({
    marketId,
    stateCollateral,
    userCollateral,
    userBorrowed,
    isFull,
    userAddress,
  }: RepayIsFullQuery): Promise<boolean> => {
    const useFullRepay = isFull && !+stateCollateral && !+userCollateral
    if (useFullRepay) return await getLlamaMarket(marketId).fullRepayIsApproved(userAddress)
    const [type, impl] = getRepayImplementation(marketId, { userCollateral, stateCollateral, userBorrowed })
    switch (type) {
      case 'V1':
      case 'V2':
        return await impl.repayIsApproved(userCollateral, userBorrowed)
      case 'deleverage':
        return true // deleverage query doesn't need approval because it only uses the user stateCollateral
      case 'unleveraged':
        return await impl.repayIsApproved(userBorrowed)
    }
  },
  category: 'user',
  validationSuite: repayFromCollateralIsFullValidationSuite,
})
