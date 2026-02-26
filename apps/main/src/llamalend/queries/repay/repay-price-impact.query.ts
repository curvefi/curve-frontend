import { repayExpectedBorrowedQueryKey } from '@/llamalend/queries/repay/repay-expected-borrowed.query'
import { parseRoute } from '@ui-kit/entities/router-api'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { type RepayParams, type RepayQuery } from '../validation/manage-loan.types'
import { repayValidationSuite } from '../validation/manage-loan.validation'
import { getRepayImplementation } from './repay-query.helpers'

type RepayPriceImpactResult = number

export const { useQuery: useRepayPriceImpact, invalidate: invalidateRepayPriceImpact } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    stateCollateral = '0',
    userCollateral = '0',
    userBorrowed = '0',
    userAddress,
    routeId,
  }: RepayParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'repayPriceImpact',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
      { routeId },
    ] as const,
  queryFn: async ({
    marketId,
    stateCollateral,
    userCollateral,
    userBorrowed,
    userAddress,
    routeId,
  }: RepayQuery): Promise<RepayPriceImpactResult> => {
    const [type, impl] = getRepayImplementation(marketId, {
      userCollateral,
      stateCollateral,
      userBorrowed,
      routeId,
    })
    switch (type) {
      case 'zapV2':
        return Number(
          (
            await impl.repayExpectedMetrics({
              stateCollateral,
              userCollateral,
              userBorrowed,
              healthIsFull: true, // this will be removed, we don't care about health here
              address: userAddress,
              ...parseRoute(routeId),
            })
          ).priceImpact,
        )
      case 'V1':
      case 'V2':
        return Number(await impl.repayPriceImpact(stateCollateral, userCollateral))
      case 'deleverage':
        return Number(await impl.priceImpact(userCollateral))
      case 'unleveraged':
        return 0 // there is no price impact, user repays debt directly
    }
  },
  staleTime: '1m',
  validationSuite: repayValidationSuite({ leverageRequired: true }),
  dependencies: (params) => [repayExpectedBorrowedQueryKey(params)],
})
