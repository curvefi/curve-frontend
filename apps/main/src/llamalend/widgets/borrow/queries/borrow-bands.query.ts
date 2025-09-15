import { borrowExpectedCollateralQueryKey } from '@/llamalend/widgets/borrow/queries/borrow-expected-collateral.query'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { BorrowFormQuery, BorrowFormQueryParams } from '../borrow.types'
import { getLlamaMarket } from '../llama.util'
import { maxBorrowReceiveKey } from './borrow-max-receive.query'
import { borrowQueryValidationSuite } from './borrow.validation'

type BorrowBandsResult = [number, number]

export const { useQuery: useBorrowBands } = queryFactory({
  queryKey: ({
    chainId,
    poolId,
    userBorrowed = 0,
    userCollateral = 0,
    debt = 0,
    leverageEnabled,
    range,
  }: BorrowFormQueryParams) =>
    [
      ...rootKeys.pool({ chainId, poolId }),
      'createLoanBands',
      { userCollateral },
      { userBorrowed },
      { debt },
      { leverageEnabled },
      { range },
    ] as const,
  queryFn: ({
    poolId,
    userBorrowed = 0,
    userCollateral = 0,
    debt = 0,
    leverageEnabled,
    range,
  }: BorrowFormQuery): Promise<BorrowBandsResult> => {
    const market = getLlamaMarket(poolId)
    return leverageEnabled
      ? market instanceof LendMarketTemplate
        ? market.leverage.createLoanBands(userCollateral, userBorrowed, debt, range)
        : market.leverageV2.hasLeverage()
          ? market.leverageV2.createLoanBands(userCollateral, userBorrowed, debt, range)
          : market.leverage.createLoanBands(userCollateral, debt, range)
      : market.createLoanBands(userCollateral, userBorrowed, range)
  },
  staleTime: '1m',
  validationSuite: borrowQueryValidationSuite,
  dependencies: (params) => [
    maxBorrowReceiveKey(params),
    ...(params.leverageEnabled ? [borrowExpectedCollateralQueryKey(params)] : []),
  ],
})
