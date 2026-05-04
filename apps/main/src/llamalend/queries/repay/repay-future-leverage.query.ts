import type { RepayParams, RepayQuery } from '@/llamalend/queries/validation/repay.types'
import { repayValidationSuite } from '@/llamalend/queries/validation/repay.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { decimal } from '@ui-kit/utils'
import { getRepayImplementation } from './repay-query.helpers'

export const { useQuery: useRepayFutureLeverage, invalidate: invalidateRepayFutureLeverage } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    stateCollateral = '0',
    userCollateral = '0',
    userBorrowed = '0',
    userAddress,
    slippage,
    routeId,
    isFull,
  }: RepayParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'repayFutureLeverage',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
      { slippage },
      { routeId },
      { isFull },
    ] as const,
  queryFn: async ({
    marketId,
    userAddress,
    stateCollateral,
    userCollateral,
    userBorrowed,
    slippage,
    routeId,
    isFull,
  }: RepayQuery) => {
    if (isFull) return '0' satisfies Decimal
    const [type, impl, args] = getRepayImplementation(marketId, {
      userCollateral,
      stateCollateral,
      userBorrowed,
      routeId,
      slippage,
    })
    switch (type) {
      case 'zapV2':
        return decimal(await impl.repayFutureLeverage(...args)) ?? null
      case 'V1':
      case 'V2':
        return decimal(await impl.repayFutureLeverage(...args, userAddress)) ?? null
      case 'unleveragedMint':
        return decimal(await impl.repayFutureLeverage(...args, userAddress)) ?? null
      case 'unleveragedLend':
        return decimal(await impl.repayFutureLeverage(userBorrowed, userAddress)) ?? null
      case 'deleverage':
        throw new Error('Future leverage is not available for deleverage repay')
    }
  },
  category: 'llamalend.repay',
  validationSuite: repayValidationSuite({ leverageRequired: false, validateMax: false }),
})
