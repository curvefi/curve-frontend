import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { BorrowFormQuery, BorrowFormQueryParams } from '../types'
import { borrowExpectedCollateralQueryKey } from './borrow-expected-collateral.query'
import { maxBorrowReceiveKey } from './borrow-max-receive.query'
import { borrowQueryValidationSuite } from './borrow.validation'

export const { useQuery: useBorrowHealth } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    userBorrowed,
    userCollateral,
    debt,
    leverageEnabled,
    range,
  }: BorrowFormQueryParams) =>
    [
      ...rootKeys.market({ chainId, marketId }),
      'createLoanHealth',
      { userCollateral },
      { userBorrowed },
      { debt },
      { leverageEnabled },
      { range },
    ] as const,
  queryFn: async ({
    marketId,
    userBorrowed = '0',
    userCollateral = '0',
    debt = '0',
    leverageEnabled,
    range,
  }: BorrowFormQuery): Promise<number> => {
    const market = getLlamaMarket(marketId)
    return leverageEnabled
      ? market instanceof LendMarketTemplate
        ? +(await market.leverage.createLoanHealth(userCollateral, userBorrowed, debt, range))
        : market.leverageV2.hasLeverage()
          ? +(await market.leverageV2.createLoanHealth(userCollateral, userBorrowed, debt, range))
          : +(await market.leverage.createLoanHealth(userCollateral, debt, range))
      : +(await market.createLoanHealth(userCollateral, debt, range))
  },
  staleTime: '1m',
  validationSuite: borrowQueryValidationSuite,
  dependencies: (params) => [
    maxBorrowReceiveKey(params),
    ...(params.leverageEnabled ? [borrowExpectedCollateralQueryKey(params)] : []),
  ],
})
