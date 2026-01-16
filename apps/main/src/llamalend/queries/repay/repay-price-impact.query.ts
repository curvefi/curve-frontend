import { repayExpectedBorrowedQueryKey } from '@/llamalend/queries/repay/repay-expected-borrowed.query'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { type RepayParams, type RepayQuery } from '../validation/manage-loan.types'
import { repayValidationSuite } from '../validation/manage-loan.validation'
import { getRepayImplementation } from './repay-query.helpers'

type RepayPriceImpactResult = number

export const { useQuery: useRepayPriceImpact } = queryFactory({
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
      'repayPriceImpact',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
    ] as const,
  queryFn: async ({
    marketId,
    stateCollateral,
    userCollateral,
    userBorrowed,
  }: RepayQuery): Promise<RepayPriceImpactResult> => {
    const [type, impl] = getRepayImplementation(marketId, { userCollateral, stateCollateral, userBorrowed })
    switch (type) {
      case 'V1':
      case 'V2':
        return +(await impl.repayPriceImpact(stateCollateral, userCollateral))
      case 'deleverage':
        return +(await impl.priceImpact(userCollateral))
      case 'unleveraged':
        return 0 // there is no price impact, user repays debt directly
    }
  },
  staleTime: '1m',
  validationSuite: repayValidationSuite({ leverageRequired: true }),
  dependencies: (params) => [repayExpectedBorrowedQueryKey(params)],
})
