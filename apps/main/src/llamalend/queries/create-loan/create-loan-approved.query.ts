import { getLlamaMarket } from '@/llamalend/llama.utils'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { CreateLoanDebtQuery, CreateLoanFormQueryParams } from '../../features/borrow/types'
import { createLoanQueryValidationSuite } from '../validation/borrow.validation'

export const { useQuery: useCreateLoanIsApproved, fetchQuery: fetchCreateLoanIsApproved } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    userCollateral = '0',
    userBorrowed = '0',
    leverageEnabled,
  }: CreateLoanFormQueryParams) =>
    [
      ...rootKeys.market({ chainId, marketId }),
      'createLoanIsApproved',
      { userCollateral },
      { userBorrowed },
      { leverageEnabled },
    ] as const,
  queryFn: async ({
    marketId,
    userBorrowed = '0',
    userCollateral = '0',
    leverageEnabled,
  }: CreateLoanDebtQuery): Promise<boolean> => {
    const market = getLlamaMarket(marketId)
    return leverageEnabled
      ? market instanceof MintMarketTemplate && market.leverageV2.hasLeverage()
        ? await market.leverageV2.createLoanIsApproved(userCollateral, userBorrowed)
        : await market.leverage.createLoanIsApproved(userCollateral, userBorrowed)
      : await market.createLoanIsApproved(userCollateral)
  },
  staleTime: '1m',
  validationSuite: createLoanQueryValidationSuite({ debtRequired: false }),
})
