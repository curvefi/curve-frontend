import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { type FieldsOf } from '@ui-kit/lib'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { BorrowFormQuery } from '../borrow.types'
import { getLlamaMarket } from '../llama.util'
import { borrowExpectedCollateralQueryKey } from './borrow-expected-collateral.query'
import { maxBorrowReceiveKey } from './borrow-max-receive.query'
import { borrowQueryValidationSuite } from './borrow.validation'

type BorrowPricesReceiveQuery = BorrowFormQuery
type BorrowPricesReceiveParams = FieldsOf<BorrowPricesReceiveQuery>

type BorrowPricesResult = [number, number]

const convertNumbers = (prices: string[]): BorrowPricesResult => [+prices[0], +prices[1]]

export const { useQuery: useBorrowPrices } = queryFactory({
  queryKey: ({
    chainId,
    poolId,
    userBorrowed = 0,
    userCollateral = 0,
    debt = 0,
    leverageEnabled,
    range,
  }: BorrowPricesReceiveParams) =>
    [
      ...rootKeys.pool({ chainId, poolId }),
      'createLoanPrices',
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
  }: BorrowPricesReceiveQuery): Promise<BorrowPricesResult> => {
    const market = getLlamaMarket(poolId)
    return !leverageEnabled
      ? convertNumbers(await market.createLoanPrices(userCollateral, debt, range))
      : market instanceof LendMarketTemplate
        ? convertNumbers(await market.leverage.createLoanPrices(userCollateral, userBorrowed, debt, range))
        : market.leverageV2.hasLeverage()
          ? convertNumbers(await market.leverageV2.createLoanPrices(userCollateral, userBorrowed, debt, range))
          : convertNumbers(await market.leverage.createLoanPrices(userCollateral, debt, range))
  },
  staleTime: '1m',
  validationSuite: borrowQueryValidationSuite,
  dependencies: (params) => [
    maxBorrowReceiveKey(params),
    ...(params.leverageEnabled ? [borrowExpectedCollateralQueryKey(params)] : []),
  ],
})
