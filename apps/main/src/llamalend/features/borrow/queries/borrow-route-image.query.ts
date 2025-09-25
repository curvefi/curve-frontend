import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { stringNumber, Zero } from '@ui-kit/utils'
import type { BorrowFormQuery, BorrowFormQueryParams } from '../types'
import { borrowQueryValidationSuite } from './borrow.validation'

export const { useQuery: useBorrowRouteImage } = queryFactory({
  queryKey: ({ chainId, poolId, userBorrowed = Zero, debt = Zero }: BorrowFormQueryParams) =>
    [...rootKeys.pool({ chainId, poolId }), 'createLoanRouteImage', { userBorrowed }, { debt }] as const,
  queryFn: async ({ poolId, userBorrowed = Zero, debt = Zero }: BorrowFormQuery): Promise<string | undefined> => {
    const market = getLlamaMarket(poolId)
    return market instanceof LendMarketTemplate
      ? await market.leverage.createLoanRouteImage(stringNumber(userBorrowed), stringNumber(debt))
      : market.leverageV2.hasLeverage()
        ? await market.leverageV2.createLoanRouteImage(stringNumber(userBorrowed), stringNumber(debt))
        : undefined
  },
  staleTime: '1m',
  validationSuite: borrowQueryValidationSuite,
})
