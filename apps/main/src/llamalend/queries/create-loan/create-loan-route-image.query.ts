import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { BorrowFormQuery, BorrowFormQueryParams } from '../../features/borrow/types'
import { borrowQueryValidationSuite } from '../validation/borrow.validation'

export const { useQuery: useCreateLoanRouteImage } = queryFactory({
  queryKey: ({ chainId, marketId, userBorrowed = '0', debt = '0' }: BorrowFormQueryParams) =>
    [...rootKeys.market({ chainId, marketId }), 'createLoanRouteImage', { userBorrowed }, { debt }] as const,
  queryFn: async ({ marketId, userBorrowed = '0', debt = '0' }: BorrowFormQuery) => {
    const market = getLlamaMarket(marketId)
    return market instanceof LendMarketTemplate
      ? await market.leverage.createLoanRouteImage(userBorrowed, debt)
      : market.leverageV2.hasLeverage()
        ? await market.leverageV2.createLoanRouteImage(userBorrowed, debt)
        : null
  },
  staleTime: '1m',
  validationSuite: borrowQueryValidationSuite,
})
