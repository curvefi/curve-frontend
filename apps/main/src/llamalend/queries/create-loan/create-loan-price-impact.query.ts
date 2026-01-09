import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { CreateLoanDebtParams, CreateLoanDebtQuery } from '../../features/borrow/types'
import { createLoanQueryValidationSuite } from '../validation/borrow.validation'
import { createLoanExpectedCollateralQueryKey } from './create-loan-expected-collateral.query'

type CreateLoanPriceImpactResult = number // percentage

export const { useQuery: useCreateLoanPriceImpact } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    userBorrowed = '0',
    userCollateral = '0',
    debt = '0',
    leverageEnabled,
    maxDebt,
  }: CreateLoanDebtParams) =>
    [
      ...rootKeys.market({ chainId, marketId }),
      'createLoanPriceImpact',
      { userCollateral },
      { userBorrowed },
      { debt },
      { leverageEnabled },
      { maxDebt },
    ] as const,
  queryFn: async ({
    marketId,
    userBorrowed = '0',
    userCollateral = '0',
    debt = '0',
  }: CreateLoanDebtQuery): Promise<CreateLoanPriceImpactResult> => {
    const market = getLlamaMarket(marketId)
    return market instanceof LendMarketTemplate
      ? +(await market.leverage.createLoanPriceImpact(userBorrowed, debt))
      : market.leverageV2.hasLeverage()
        ? +(await market.leverageV2.createLoanPriceImpact(userBorrowed, debt))
        : +(await market.leverage.priceImpact(userCollateral, debt))
  },
  staleTime: '1m',
  validationSuite: createLoanQueryValidationSuite({ debtRequired: true, isLeverageRequired: true }),
  dependencies: (params) => [createLoanExpectedCollateralQueryKey(params)],
})
