import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { type RepayParams, type RepayQuery } from '../validation/manage-loan.types'
import { repayValidationSuite } from '../validation/manage-loan.validation'
import { getRepayImplementation, getUserDebtFromQueryCache } from './repay-query.helpers'

export const { useQuery: useRepayIsAvailable } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    stateCollateral = '0',
    userCollateral = '0',
    userBorrowed = '0',
    userAddress,
    route,
  }: RepayParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'repayIsAvailable',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
      { route },
    ] as const,
  queryFn: async ({
    chainId,
    marketId,
    stateCollateral,
    userCollateral,
    userBorrowed,
    userAddress,
    route,
  }: RepayQuery): Promise<boolean> => {
    const [type, impl, args] = getRepayImplementation(marketId, {
      userCollateral,
      stateCollateral,
      userBorrowed,
      route,
    })
    switch (type) {
      case 'zapV2':
        return await impl.repayIsAvailable(...args)
      case 'V1':
      case 'V2':
        return await impl.repayIsAvailable(...args, userAddress)
      case 'deleverage':
        return await impl.isAvailable(...args, userAddress)
      case 'unleveraged':
        // For unleveraged markets, repayment is available when user has debt
        return !!getUserDebtFromQueryCache({ chainId, marketId, userAddress })
    }
  },
  staleTime: '1m',
  validationSuite: repayValidationSuite({ leverageRequired: false }),
})
