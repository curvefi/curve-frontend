import { type FieldsOf } from '@ui-kit/lib'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { LlamaMarketType } from '@ui-kit/types/market'
import type { BorrowFormQuery } from '../borrow.types'
import { getLlamaMarket } from '../llama.util'
import { borrowQueryValidationSuite } from './borrow.validation'

type BorrowPricesReceiveQuery = BorrowFormQuery
type BorrowPricesReceiveParams = FieldsOf<BorrowPricesReceiveQuery>

type BorrowPricesResult = [number, number]

const convertNumbers = (prices: string[]): BorrowPricesResult => [+prices[0], +prices[1]]

export const { useQuery: useBorrowPrices } = queryFactory({
  queryKey: ({ chainId, poolId, userBorrowed, userCollateral, debt, range }: BorrowPricesReceiveParams) =>
    [
      ...rootKeys.pool({ chainId, poolId }),
      'borrow-prices',
      { userCollateral },
      { userBorrowed },
      { debt },
      { range },
    ] as const,
  queryFn: async ({
    poolId,
    userBorrowed = 0,
    userCollateral = 0,
    debt = 0,
    range,
  }: BorrowPricesReceiveQuery): Promise<BorrowPricesResult> => {
    const [market, type] = getLlamaMarket(poolId)
    return type === LlamaMarketType.Lend
      ? convertNumbers(await market.leverage.createLoanPrices(userCollateral, userBorrowed, debt, range))
      : market.leverageV2.hasLeverage()
        ? convertNumbers(await market.leverageV2.createLoanPrices(userCollateral, userBorrowed, debt, range))
        : convertNumbers(await market.leverage.createLoanPrices(userCollateral, debt, range))
  },
  staleTime: '1m',
  validationSuite: borrowQueryValidationSuite,
})
