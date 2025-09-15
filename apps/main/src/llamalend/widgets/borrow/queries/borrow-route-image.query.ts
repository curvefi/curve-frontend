import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { BorrowFormQuery, BorrowFormQueryParams } from '../borrow.types'
import { getLlamaMarket } from '../llama.util'
import { borrowQueryValidationSuite } from './borrow.validation'

export const { useQuery: useBorrowRouteImage } = queryFactory({
  queryKey: ({ chainId, poolId, userBorrowed = 0, debt = 0 }: BorrowFormQueryParams) =>
    [...rootKeys.pool({ chainId, poolId }), 'borrow-route-image', { userBorrowed }, { debt }] as const,
  queryFn: async ({ poolId, userBorrowed = 0, debt = 0 }: BorrowFormQuery): Promise<string | undefined> => {
    const market = getLlamaMarket(poolId)
    return market instanceof LendMarketTemplate
      ? await market.leverage.createLoanRouteImage(userBorrowed, debt)
      : market.leverageV2.hasLeverage()
        ? await market.leverageV2.createLoanRouteImage(userBorrowed, debt)
        : undefined
  },
  staleTime: '1m',
  validationSuite: borrowQueryValidationSuite,
})
