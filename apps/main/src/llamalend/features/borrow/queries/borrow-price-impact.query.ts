import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { stringNumber, Zero } from '@ui-kit/utils'
import type { BorrowFormQuery, BorrowFormQueryParams } from '../types'
import { borrowExpectedCollateralQueryKey } from './borrow-expected-collateral.query'
import { borrowQueryValidationSuite } from './borrow.validation'

type BorrowPriceImpactResult = number // percentage

export const { useQuery: useBorrowPriceImpact } = queryFactory({
  queryKey: ({ chainId, poolId, userBorrowed = Zero, userCollateral = Zero, debt = Zero }: BorrowFormQueryParams) =>
    [
      ...rootKeys.pool({ chainId, poolId }),
      'createLoanPriceImpact',
      { userCollateral },
      { userBorrowed },
      { debt },
    ] as const,
  queryFn: async ({
    poolId,
    userBorrowed = Zero,
    userCollateral = Zero,
    debt = Zero,
  }: BorrowFormQuery): Promise<BorrowPriceImpactResult> => {
    const market = getLlamaMarket(poolId)
    return market instanceof LendMarketTemplate
      ? +(await market.leverage.createLoanPriceImpact(stringNumber(userBorrowed), stringNumber(debt)))
      : market.leverageV2.hasLeverage()
        ? +(await market.leverageV2.createLoanPriceImpact(stringNumber(userBorrowed), stringNumber(debt)))
        : +(await market.leverage.priceImpact(stringNumber(userCollateral), stringNumber(debt)))
  },
  staleTime: '1m',
  validationSuite: borrowQueryValidationSuite,
  dependencies: (params) => [borrowExpectedCollateralQueryKey(params)],
})
