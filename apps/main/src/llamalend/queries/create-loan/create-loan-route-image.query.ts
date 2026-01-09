import { getLlamaMarket } from '@/llamalend/llama.utils'
import { createLoanExpectedCollateralQueryKey } from '@/llamalend/queries/create-loan/create-loan-expected-collateral.query'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { CreateLoanDebtParams, CreateLoanDebtQuery } from '../../features/borrow/types'
import { createLoanQueryValidationSuite } from '../validation/borrow.validation'

export const { useQuery: useCreateLoanRouteImage } = queryFactory({
  queryKey: ({ chainId, marketId, userBorrowed = '0', debt = '0', maxDebt }: CreateLoanDebtParams) =>
    [
      ...rootKeys.market({ chainId, marketId }),
      'createLoanRouteImage',
      { userBorrowed },
      { debt },
      { maxDebt },
    ] as const,
  queryFn: async ({ marketId, userBorrowed = '0', debt = '0' }: CreateLoanDebtQuery) => {
    const market = getLlamaMarket(marketId)
    return market instanceof LendMarketTemplate
      ? await market.leverage.createLoanRouteImage(userBorrowed, debt)
      : market.leverageV2.hasLeverage()
        ? await market.leverageV2.createLoanRouteImage(userBorrowed, debt)
        : null
  },
  staleTime: '1m',
  validationSuite: createLoanQueryValidationSuite({ debtRequired: true }),
  dependencies: (params) => [createLoanExpectedCollateralQueryKey(params)],
})
