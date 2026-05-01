import { repayExpectedBorrowedQueryKey } from '@/llamalend/queries/repay/repay-expected-borrowed.query'
import type { RepayQuery, RepayParams } from '@/llamalend/queries/validation/repay.types'
import { repayValidationSuite } from '@/llamalend/queries/validation/repay.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { parseRoute } from '@ui-kit/entities/router-api'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { decimal } from '@ui-kit/utils'
import { getRepayImplementation } from './repay-query.helpers'

export const { useQuery: useRepayPriceImpact, invalidate: invalidateRepayPriceImpact } = queryFactory({
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
      'repayPriceImpact',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
      { slippage },
      { routeId },
    ] as const,
  queryFn: async ({
    marketId,
    stateCollateral,
    userCollateral,
    userBorrowed,
    userAddress,
    slippage,
    routeId,
  }: RepayQuery): Promise<Decimal | null> => {
    const [type, impl] = getRepayImplementation(marketId, {
      userCollateral,
      stateCollateral,
      userBorrowed,
      slippage,
      routeId,
    })
    switch (type) {
      case 'zapV2': {
        const { priceImpact } = await impl.repayExpectedMetrics({
          stateCollateral,
          userCollateral,
          userBorrowed,
          healthIsFull: true, // this will be removed, we don't care about health here
          address: userAddress,
          ...parseRoute(routeId),
        })
        return decimal(priceImpact) ?? null
      }
      case 'V1':
      case 'V2':
        return decimal(await impl.repayPriceImpact(stateCollateral, userCollateral)) ?? null
      case 'deleverage':
        return decimal(await impl.priceImpact(userCollateral)) ?? null
      case 'unleveragedLend':
      case 'unleveragedMint':
        return '0' // there is no price impact, user repays debt directly
    }
  },
  category: 'llamalend.repay',
  validationSuite: repayValidationSuite({ leverageRequired: true, validateMax: false }),
  dependencies: params => [repayExpectedBorrowedQueryKey(params)],
})
