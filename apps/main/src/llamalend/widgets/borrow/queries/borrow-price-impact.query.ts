import { borrowQueryValidationSuite } from '@/llamalend/widgets/borrow/queries/borrow.validation'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { LlamaMarketType } from '@ui-kit/types/market'
import type { BorrowFormQuery, BorrowFormQueryParams } from '../borrow.types'
import { getLlamaMarket } from '../llama.util'

type BorrowPriceImpactResult = number // percentage

export const { useQuery: useBorrowPriceImpact } = queryFactory({
  queryKey: ({ chainId, poolId, userBorrowed, userCollateral, debt }: BorrowFormQueryParams) =>
    [
      ...rootKeys.pool({ chainId, poolId }),
      'borrow-price-impact',
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
    const [market, type] = getLlamaMarket(poolId)
    // todo: check if it's correct to pass userCollateral to the old markets and userBorrowed to the new ones
    return type === LlamaMarketType.Lend
      ? +(await market.leverage.createLoanPriceImpact(userBorrowed, debt))
      : market.leverageV2.hasLeverage()
        ? +(await market.leverageV2.createLoanPriceImpact(userBorrowed, debt))
        : +(await market.leverage.priceImpact(userCollateral, debt))
  },
  staleTime: '1m',
  validationSuite: borrowQueryValidationSuite,
})
