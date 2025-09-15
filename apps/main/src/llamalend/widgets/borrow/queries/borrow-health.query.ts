import { borrowExpectedCollateralQueryKey } from '@/llamalend/widgets/borrow/queries/borrow-expected-collateral.query'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { BorrowFormQuery, BorrowFormQueryParams } from '../borrow.types'
import { getLlamaMarket } from '../llama.util'
import { maxBorrowReceiveKey } from './borrow-max-receive.query'
import { borrowQueryValidationSuite } from './borrow.validation'

export const { useQuery: useBorrowHealth } = queryFactory({
  queryKey: ({ chainId, poolId, userBorrowed, userCollateral, debt, leverageEnabled, range }: BorrowFormQueryParams) =>
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
    userBorrowed = 0,
    userCollateral = 0,
    debt = 0,
    leverageEnabled,
    range,
  }: BorrowFormQuery): Promise<number> => {
    const market = getLlamaMarket(poolId)
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
