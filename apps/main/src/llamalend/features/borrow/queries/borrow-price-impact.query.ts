import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { BorrowFormQuery, BorrowFormQueryParams } from '../borrow.types'
import { getLlamaMarket } from '../llama.util'
import { borrowExpectedCollateralQueryKey } from './borrow-expected-collateral.query'
import { borrowQueryValidationSuite } from './borrow.validation'

type BorrowPriceImpactResult = number // percentage

export const { useQuery: useBorrowPriceImpact } = queryFactory({
  queryKey: ({ chainId, poolId, userBorrowed = 0, userCollateral = 0, debt = 0 }: BorrowFormQueryParams) =>
    [
      ...rootKeys.pool({ chainId, poolId }),
      'createLoanPriceImpact',
      { userCollateral },
      { userBorrowed },
      { debt },
    ] as const,
  queryFn: async ({
    poolId,
    userBorrowed = 0,
    userCollateral = 0,
    debt = 0,
  }: BorrowFormQuery): Promise<BorrowPriceImpactResult> => {
    const market = getLlamaMarket(poolId)
    return market instanceof LendMarketTemplate
      ? +(await market.leverage.createLoanPriceImpact(userBorrowed, debt))
      : market.leverageV2.hasLeverage()
        ? +(await market.leverageV2.createLoanPriceImpact(userBorrowed, debt))
        : +(await market.leverage.priceImpact(userCollateral, debt))
  },
  staleTime: '1m',
  validationSuite: borrowQueryValidationSuite,
  dependencies: (params) => [borrowExpectedCollateralQueryKey(params)],
})
