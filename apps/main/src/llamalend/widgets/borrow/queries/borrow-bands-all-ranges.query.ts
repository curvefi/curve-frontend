import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { LlamaMarketType } from '@ui-kit/types/market'
import type { BorrowFormQuery, BorrowFormQueryParams } from '../borrow.types'
import { getLlamaMarket } from '../llama.util'
import { maxBorrowReceiveKey } from './borrow-max-receive.query'
import { borrowQueryValidationSuite } from './borrow.validation'

type BorrowBandsResult = Record<number, [number, number] | null>

export const { useQuery: useBorrowBandsAllRanges } = queryFactory({
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
    ] as const,
  queryFn: async ({
    poolId,
    userBorrowed = 0,
    userCollateral = 0,
    debt = 0,
    leverage,
  }: BorrowFormQuery): Promise<BorrowBandsResult> => {
    const [market, type] = getLlamaMarket(poolId)
    return !leverage
      ? market.createLoanBandsAllRanges(userCollateral, userBorrowed)
      : type === LlamaMarketType.Lend
        ? market.leverage.createLoanBandsAllRanges(userCollateral, userBorrowed, debt)
        : market.leverageV2.hasLeverage()
          ? await market.leverageV2.createLoanBandsAllRanges(userCollateral, userBorrowed, debt)
          : await market.leverage.createLoanBandsAllRanges(userCollateral, debt)
  },
  staleTime: '1m',
  validationSuite: borrowQueryValidationSuite,
  dependencies: (params) => [maxBorrowReceiveKey(params)],
})
