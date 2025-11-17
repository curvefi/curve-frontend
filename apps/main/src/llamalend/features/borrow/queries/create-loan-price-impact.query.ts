import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { BorrowFormQuery, BorrowFormQueryParams } from '../types'
import { borrowQueryValidationSuite } from './borrow.validation'
import { createLoanExpectedCollateralQueryKey } from './create-loan-expected-collateral.query'

type BorrowPriceImpactResult = number // percentage

export const { useQuery: useCreateLoanPriceImpact } = queryFactory({
  queryKey: ({ chainId, marketId, userBorrowed = '0', userCollateral = '0', debt = '0' }: BorrowFormQueryParams) =>
    [
      ...rootKeys.market({ chainId, marketId }),
      'createLoanPriceImpact',
      { userCollateral },
      { userBorrowed },
      { debt },
    ] as const,
  queryFn: async ({
    marketId,
    userBorrowed = '0',
    userCollateral = '0',
    debt = '0',
  }: BorrowFormQuery): Promise<BorrowPriceImpactResult> => {
    const market = getLlamaMarket(marketId)
    return market instanceof LendMarketTemplate
      ? +(await market.leverage.createLoanPriceImpact(userBorrowed, debt))
      : market.leverageV2.hasLeverage()
        ? +(await market.leverageV2.createLoanPriceImpact(userBorrowed, debt))
        : +(await market.leverage.priceImpact(userCollateral, debt))
  },
  staleTime: '1m',
  validationSuite: borrowQueryValidationSuite,
  dependencies: (params) => [createLoanExpectedCollateralQueryKey(params)],
})
