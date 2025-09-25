import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { stringNumber, Zero } from '@ui-kit/utils'
import type { BorrowFormQuery, BorrowFormQueryParams } from '../types'
import { borrowExpectedCollateralQueryKey } from './borrow-expected-collateral.query'
import { maxBorrowReceiveKey } from './borrow-max-receive.query'
import { borrowQueryValidationSuite } from './borrow.validation'

type BorrowBandsResult = [number, number]

export const { useQuery: useBorrowBands } = queryFactory({
  queryKey: ({
    chainId,
    poolId,
    userBorrowed = Zero,
    userCollateral = Zero,
    debt = Zero,
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
    userBorrowed = Zero,
    userCollateral = Zero,
    debt = Zero,
    leverageEnabled,
    range,
  }: BorrowFormQuery): Promise<BorrowBandsResult> => {
    const market = getLlamaMarket(poolId)
    const [collateral, borrowed, userDebt] = [userCollateral, userBorrowed, debt].map(stringNumber)
    return leverageEnabled
      ? market instanceof LendMarketTemplate
        ? market.leverage.createLoanBands(collateral, borrowed, userDebt, range)
        : market.leverageV2.hasLeverage()
          ? market.leverageV2.createLoanBands(collateral, borrowed, userDebt, range)
          : market.leverage.createLoanBands(collateral, userDebt, range)
      : market.createLoanBands(collateral, borrowed, range)
  },
  staleTime: '1m',
  validationSuite: borrowQueryValidationSuite,
  dependencies: (params) => [
    maxBorrowReceiveKey(params),
    ...(params.leverageEnabled ? [borrowExpectedCollateralQueryKey(params)] : []),
  ],
})
