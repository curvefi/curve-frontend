import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { type FieldsOf } from '@ui-kit/lib'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { type PreciseNumber, stringNumber, toPrecise, Zero } from '@ui-kit/utils'
import type { BorrowFormQuery } from '../types'
import { borrowExpectedCollateralQueryKey } from './borrow-expected-collateral.query'
import { maxBorrowReceiveKey } from './borrow-max-receive.query'
import { borrowQueryValidationSuite } from './borrow.validation'

type BorrowPricesReceiveQuery = BorrowFormQuery
type BorrowPricesReceiveParams = FieldsOf<BorrowPricesReceiveQuery>

type BorrowPricesResult = [PreciseNumber, PreciseNumber]

const convertNumbers = ([first, second]: string[]): BorrowPricesResult => [toPrecise(first), toPrecise(second)]

export const { useQuery: useBorrowPrices } = queryFactory({
  queryKey: ({
    chainId,
    poolId,
    userBorrowed = Zero,
    userCollateral = Zero,
    debt = Zero,
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
    userBorrowed = Zero,
    userCollateral = Zero,
    debt = Zero,
    leverageEnabled,
    range,
  }: BorrowPricesReceiveQuery): Promise<BorrowPricesResult> => {
    const market = getLlamaMarket(poolId)
    return !leverageEnabled
      ? convertNumbers(await market.createLoanPrices(stringNumber(userCollateral), stringNumber(debt), range))
      : market instanceof LendMarketTemplate
        ? convertNumbers(
            await market.leverage.createLoanPrices(
              stringNumber(userCollateral),
              stringNumber(userBorrowed),
              stringNumber(debt),
              range,
            ),
          )
        : market.leverageV2.hasLeverage()
          ? convertNumbers(
              await market.leverageV2.createLoanPrices(
                stringNumber(userCollateral),
                stringNumber(userBorrowed),
                stringNumber(debt),
                range,
              ),
            )
          : convertNumbers(
              await market.leverage.createLoanPrices(stringNumber(userCollateral), stringNumber(debt), range),
            )
  },
  staleTime: '1m',
  validationSuite: borrowQueryValidationSuite,
  dependencies: (params) => [
    maxBorrowReceiveKey(params),
    ...(params.leverageEnabled ? [borrowExpectedCollateralQueryKey(params)] : []),
  ],
})
