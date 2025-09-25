import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { stringNumber, Zero } from '@ui-kit/utils'
import type { BorrowFormQuery, BorrowFormQueryParams } from '../types'
import { borrowExpectedCollateralQueryKey } from './borrow-expected-collateral.query'
import { maxBorrowReceiveKey } from './borrow-max-receive.query'
import { borrowQueryValidationSuite } from './borrow.validation'

export const { useQuery: useBorrowHealth } = queryFactory({
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
      'createLoanHealth',
      { userCollateral },
      { userBorrowed },
      { debt },
      { leverageEnabled },
      { range },
    ] as const,
  queryFn: async ({
    poolId,
    userBorrowed = Zero,
    userCollateral = Zero,
    debt = Zero,
    leverageEnabled,
    range,
  }: BorrowFormQuery): Promise<number> => {
    const market = getLlamaMarket(poolId)
    return leverageEnabled
      ? market instanceof LendMarketTemplate
        ? +(await market.leverage.createLoanHealth(
            stringNumber(userCollateral),
            stringNumber(userBorrowed),
            stringNumber(debt),
            range,
          ))
        : market.leverageV2.hasLeverage()
          ? +(await market.leverageV2.createLoanHealth(
              stringNumber(userCollateral),
              stringNumber(userBorrowed),
              stringNumber(debt),
              range,
            ))
          : +(await market.leverage.createLoanHealth(stringNumber(userCollateral), stringNumber(debt), range))
      : +(await market.createLoanHealth(stringNumber(userCollateral), stringNumber(debt), range))
  },
  staleTime: '1m',
  validationSuite: borrowQueryValidationSuite,
  dependencies: (params) => [
    maxBorrowReceiveKey(params),
    ...(params.leverageEnabled ? [borrowExpectedCollateralQueryKey(params)] : []),
  ],
})
