import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { type RepayParams, type RepayQuery } from '../validation/manage-loan.types'
import { repayValidationSuite } from '../validation/manage-loan.validation'
import { getRepayImplementation, getUserDebt } from './repay-query.helpers'

export const { useQuery: useRepayIsAvailable } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    stateCollateral = '0',
    userCollateral = '0',
    userBorrowed = '0',
    userAddress,
  }: RepayParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'repayIsAvailable',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
    ] as const,
  queryFn: async ({
    chainId,
    marketId,
    stateCollateral,
    userCollateral,
    userBorrowed,
    userAddress,
  }: RepayQuery): Promise<boolean> => {
    const [type, impl] = getRepayImplementation(marketId, { userCollateral, stateCollateral, userBorrowed })
    switch (type) {
      case 'V1':
      case 'V2':
        return await impl.repayIsAvailable(stateCollateral, userCollateral, userBorrowed, userAddress)
      case 'deleverage':
        return await impl.isAvailable(userCollateral, userAddress)
      case 'unleveraged': {
        return !!getUserDebt({ chainId, marketId, userAddress })
      }
    }
  },
  staleTime: '1m',
  validationSuite: repayValidationSuite({ leverageRequired: false }),
})
