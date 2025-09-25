import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { llamaApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { assert, toPrecise, type PreciseNumber, Zero, fromPrecise, stringNumber } from '@ui-kit/utils'
import type { BorrowFormQuery } from '../types'
import { borrowFormValidationGroup } from './borrow.validation'

type BorrowMaxReceiveQuery = Omit<BorrowFormQuery, 'userCollateral' | 'debt'> & { userCollateral: PreciseNumber }
type BorrowMaxReceiveParams = FieldsOf<BorrowMaxReceiveQuery>

type BorrowMaxReceiveResult = {
  maxDebt: PreciseNumber
  maxTotalCollateral?: PreciseNumber
  maxLeverage?: PreciseNumber
  userCollateral?: PreciseNumber
  collateralFromUserBorrowed?: PreciseNumber
  collateralFromMaxDebt?: PreciseNumber
  avgPrice?: PreciseNumber
}
const convertNumbers = ({
  maxDebt,
  maxLeverage,
  maxTotalCollateral,
  avgPrice,
  userCollateral,
  collateralFromUserBorrowed,
  collateralFromMaxDebt,
}: { [K in keyof BorrowMaxReceiveResult]: string }): BorrowMaxReceiveResult => ({
  maxDebt: toPrecise(maxDebt),
  maxLeverage: toPrecise(maxLeverage),
  maxTotalCollateral: toPrecise(maxTotalCollateral),
  avgPrice: toPrecise(avgPrice),
  userCollateral: toPrecise(userCollateral),
  collateralFromUserBorrowed: toPrecise(collateralFromUserBorrowed),
  collateralFromMaxDebt: toPrecise(collateralFromMaxDebt),
})

export const maxReceiveValidation = createValidationSuite(
  ({ chainId, userBorrowed, userCollateral, range, slippage }: BorrowMaxReceiveParams) => {
    chainValidationGroup({ chainId })
    llamaApiValidationGroup({ chainId })
    borrowFormValidationGroup(
      { userBorrowed, userCollateral, debt: undefined, range, slippage },
      { debtRequired: false },
    )
  },
)

export const { useQuery: useMaxBorrowReceive, queryKey: maxBorrowReceiveKey } = queryFactory({
  queryKey: ({
    chainId,
    poolId,
    userBorrowed = Zero,
    userCollateral = Zero,
    range,
    leverageEnabled,
  }: BorrowMaxReceiveParams) =>
    [
      ...rootKeys.pool({ chainId, poolId }),
      'createLoanMaxRecv',
      { userBorrowed },
      { userCollateral },
      { range },
      { leverageEnabled },
    ] as const,
  queryFn: async ({
    poolId,
    userBorrowed = Zero,
    userCollateral = Zero,
    range,
    leverageEnabled,
  }: BorrowMaxReceiveQuery): Promise<BorrowMaxReceiveResult> => {
    const market = getLlamaMarket(poolId)
    if (!leverageEnabled) {
      return convertNumbers({ maxDebt: await market.createLoanMaxRecv(stringNumber(userCollateral), range) })
    }
    if (market instanceof LendMarketTemplate) {
      return convertNumbers(
        await market.leverage.createLoanMaxRecv(stringNumber(userCollateral), stringNumber(userBorrowed), range),
      )
    }
    if (market.leverageV2.hasLeverage()) {
      return convertNumbers(
        await market.leverageV2.createLoanMaxRecv(stringNumber(userCollateral), stringNumber(userBorrowed), range),
      )
    }

    assert(!fromPrecise(userBorrowed), `userBorrowed must be 0 for non-leverage mint markets`)
    const result = await market.leverage.createLoanMaxRecv(stringNumber(userCollateral), range)
    const { maxBorrowable, maxCollateral, leverage, routeIdx } = result
    return convertNumbers({ maxDebt: maxBorrowable, maxTotalCollateral: maxCollateral, maxLeverage: '9' })
  },
  staleTime: '1m',
  validationSuite: maxReceiveValidation,
})
