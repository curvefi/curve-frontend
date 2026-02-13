import { repayExpectedBorrowedQueryKey } from '@/llamalend/queries/repay/repay-expected-borrowed.query'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { parseRoute } from '@ui-kit/widgets/RouteProvider'
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
    route,
  }: RepayParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'repayPriceImpact',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
      { route },
    ] as const,
  queryFn: async ({
    marketId,
    stateCollateral,
    userCollateral,
    userBorrowed,
    userAddress,
    route,
  }: RepayQuery): Promise<RepayPriceImpactResult> => {
    const [type, impl] = getRepayImplementation(marketId, {
      userCollateral,
      stateCollateral,
      userBorrowed,
      route,
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
              ...parseRoute(route),
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
