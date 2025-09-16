import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { BorrowFormQuery, BorrowFormQueryParams } from '../borrow.types'
import { getLlamaMarket } from '../llama.util'
import { maxBorrowReceiveKey } from './borrow-max-receive.query'
import { borrowQueryValidationSuite } from './borrow.validation'

export const { useQuery: useBorrowHealth } = queryFactory({
  queryKey: ({ chainId, poolId, userBorrowed, userCollateral, debt, leverage, range }: BorrowFormQueryParams) =>
    [
      ...rootKeys.pool({ chainId, poolId }),
      'max-borrow-receive',
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
  }: BorrowFormQuery): Promise<number> => {
    const market = getLlamaMarket(poolId)
    if (!leverage) return +(await market.createLoanHealth(userCollateral, debt, range))
    if (market instanceof LendMarketTemplate) {
      return +(await market.leverage.createLoanHealth(userCollateral, userBorrowed, debt, range))
    }
    if (market.leverageV2.hasLeverage()) {
      return +(await market.leverageV2.createLoanHealth(userCollateral, userBorrowed, debt, range))
    }
    return +(await market.leverage.createLoanHealth(userCollateral, debt, range))
  },
  staleTime: '1m',
  validationSuite: borrowQueryValidationSuite,
  dependencies: (params) => [maxBorrowReceiveKey(params)],
})
