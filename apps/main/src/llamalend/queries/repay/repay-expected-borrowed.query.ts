import type { RepayQuery, RepayParams } from '@/llamalend/queries/validation/repay.types'
import { repayValidationSuite } from '@/llamalend/queries/validation/repay.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { decimal } from '@ui-kit/utils'
import { getRepayImplementation, getUserDebtFromQueryCache } from './repay-query.helpers'

type RepayExpectedBorrowedResult = {
  totalBorrowed: Decimal
  borrowedFromStateCollateral?: Decimal
  borrowedFromUserCollateral?: Decimal
  debt?: Decimal
  avgPrice?: Decimal
}

export const {
  useQuery: useRepayExpectedBorrowed,
  queryKey: repayExpectedBorrowedQueryKey,
  invalidate: invalidateRepayExpectedBorrowed,
  reset: resetRepayExpectedBorrowed,
} = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    stateCollateral = '0',
    userCollateral = '0',
    debt = '0',
    userAddress,
    slippage,
    routeId,
  }: RepayParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'repayExpectedBorrowed',
      { stateCollateral },
      { userCollateral },
      { debt },
      { slippage },
      { routeId },
    ] as const,
  queryFn: async ({
    chainId,
    marketId,
    userAddress,
    stateCollateral,
    userCollateral,
    debt,
    slippage,
    routeId,
  }: RepayQuery) => {
    const [type, impl, args] = getRepayImplementation(marketId, {
      userCollateral,
      stateCollateral,
      debt,
      routeId,
      slippage,
    })
    switch (type) {
      case 'zapV2':
        return (await impl.repayExpectedBorrowed(...args)) as RepayExpectedBorrowedResult
      case 'V1':
      case 'V2':
        return (await impl.repayExpectedBorrowed(...args, +slippage)) as RepayExpectedBorrowedResult
      case 'deleverage': {
        const { stablecoins, routeIdx } = await impl.repayStablecoins(...args)
        return { totalBorrowed: stablecoins[routeIdx] as Decimal }
      }
      case 'unleveragedMint':
      case 'unleveragedLend':
        return {
          totalBorrowed: decimal(getUserDebtFromQueryCache({ chainId, marketId, userAddress }) - +debt)!,
        }
    }
  },
  category: 'llamalend.repay',
  validationSuite: repayValidationSuite({ leverageRequired: false, validateMax: false }),
})
