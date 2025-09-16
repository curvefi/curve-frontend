import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
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
    leverageEnabled,
  }: BorrowFormQueryParams) =>
    [
      ...rootKeys.pool({ chainId, poolId }),
      'createLoanBandsAllRanges',
      { userCollateral },
      { userBorrowed },
      { debt },
      { leverageEnabled },
    ] as const,
  queryFn: async ({
    poolId,
    userBorrowed = 0,
    userCollateral = 0,
    debt = 0,
    leverageEnabled,
  }: BorrowFormQuery): Promise<BorrowBandsResult> => {
    const market = getLlamaMarket(poolId)
    return leverageEnabled
      ? market instanceof LendMarketTemplate
        ? market.leverage.createLoanBandsAllRanges(userCollateral, userBorrowed, debt)
        : market.leverageV2.hasLeverage()
          ? await market.leverageV2.createLoanBandsAllRanges(userCollateral, userBorrowed, debt)
          : await market.leverage.createLoanBandsAllRanges(userCollateral, debt)
      : market.createLoanBandsAllRanges(userCollateral, userBorrowed)
  },
  staleTime: '1m',
  validationSuite: borrowQueryValidationSuite,
  dependencies: (params) => [maxBorrowReceiveKey(params)],
})
