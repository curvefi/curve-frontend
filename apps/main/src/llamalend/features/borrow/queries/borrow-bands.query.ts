import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { BorrowFormQuery, BorrowFormQueryParams } from '../types'
import { borrowExpectedCollateralQueryKey } from './borrow-expected-collateral.query'
import { maxBorrowReceiveKey } from './borrow-max-receive.query'
import { borrowQueryValidationSuite } from './borrow.validation'

type BorrowBandsResult = [number, number]

export const { useQuery: useCreateLoanBands } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    userBorrowed = '0',
    userCollateral = '0',
    debt = '0',
    leverageEnabled,
    range,
  }: BorrowFormQueryParams) =>
    [
      ...rootKeys.market({ chainId, marketId }),
      'createLoanBands',
      { userCollateral },
      { userBorrowed },
      { debt },
      { leverageEnabled },
      { range },
    ] as const,
  queryFn: ({
    marketId,
    userBorrowed = '0',
    userCollateral = '0',
    debt = '0',
    leverageEnabled,
    range,
  }: BorrowFormQuery): Promise<BorrowBandsResult> => {
    const market = getLlamaMarket(marketId)
    return leverageEnabled
      ? market instanceof LendMarketTemplate
        ? market.leverage.createLoanBands(userCollateral, userBorrowed, debt, range)
        : market.leverageV2.hasLeverage()
          ? market.leverageV2.createLoanBands(userCollateral, userBorrowed, debt, range)
          : market.leverage.createLoanBands(userCollateral, debt, range)
      : market.createLoanBands(userCollateral, debt, range)
  },
  staleTime: '1m',
  validationSuite: borrowQueryValidationSuite,
  dependencies: (params) => [
    maxBorrowReceiveKey(params),
    ...(params.leverageEnabled ? [borrowExpectedCollateralQueryKey(params)] : []),
  ],
})
