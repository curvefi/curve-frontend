import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { LlamaMarketType } from '@ui-kit/types/market'
import type { BorrowFormQuery, BorrowFormQueryParams } from '../borrow.types'
import { getLlamaMarket } from '../llama.util'
import { borrowQueryValidationSuite } from './borrow.validation'

type BorrowBandsResult = [number, number]

export const { useQuery: useBorrowBands } = queryFactory({
  queryKey: ({
    chainId,
    poolId,
    userBorrowed = 0,
    userCollateral = 0,
    debt = 0,
    leverage,
    range,
  }: BorrowFormQueryParams) =>
    [
      ...rootKeys.pool({ chainId, poolId }),
      'borrow-bands',
      { userCollateral },
      { userBorrowed },
      { debt },
      { leverage },
      { range },
    ] as const,
  queryFn: async ({
    poolId,
    userBorrowed = 0,
    userCollateral = 0,
    debt = 0,
    leverage,
    range,
  }: BorrowFormQuery): Promise<BorrowBandsResult> => {
    const [market, type] = getLlamaMarket(poolId)
    return !leverage
      ? market.createLoanBands(userCollateral, userBorrowed, range)
      : type === LlamaMarketType.Lend
        ? market.leverage.createLoanBands(userCollateral, userBorrowed, debt, range)
        : market.leverageV2.hasLeverage()
          ? await market.leverageV2.createLoanBands(userCollateral, userBorrowed, debt, range)
          : await market.leverage.createLoanBands(userCollateral, debt, range)
  },
  staleTime: '1m',
  validationSuite: borrowQueryValidationSuite,
})
