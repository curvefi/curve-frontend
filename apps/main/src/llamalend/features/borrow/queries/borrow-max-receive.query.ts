import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { llamaApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { assert, decimal, Decimal } from '@ui-kit/utils'
import type { BorrowFormQuery } from '../types'
import { borrowFormValidationGroup } from './borrow.validation'

type BorrowMaxReceiveQuery = Omit<BorrowFormQuery, 'userCollateral' | 'debt'> & { userCollateral: Decimal }
type BorrowMaxReceiveParams = FieldsOf<BorrowMaxReceiveQuery>

type BorrowMaxReceiveResult = {
  maxDebt: Decimal
  maxTotalCollateral?: Decimal
  maxLeverage?: Decimal
  userCollateral?: Decimal
  collateralFromUserBorrowed?: Decimal
  collateralFromMaxDebt?: Decimal
  avgPrice?: Decimal
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
  maxDebt: maxDebt as Decimal,
  maxLeverage: decimal(maxLeverage),
  maxTotalCollateral: decimal(maxTotalCollateral),
  avgPrice: decimal(avgPrice),
  userCollateral: decimal(userCollateral),
  collateralFromUserBorrowed: decimal(collateralFromUserBorrowed),
  collateralFromMaxDebt: decimal(collateralFromMaxDebt),
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
    userBorrowed = `0`,
    userCollateral = `0`,
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
    userBorrowed = `0`,
    userCollateral = `0`,
    range,
    leverageEnabled,
  }: BorrowMaxReceiveQuery): Promise<BorrowMaxReceiveResult> => {
    const market = getLlamaMarket(poolId)
    if (!leverageEnabled) {
      return convertNumbers({ maxDebt: await market.createLoanMaxRecv(userCollateral, range) })
    }
    if (market instanceof LendMarketTemplate) {
      return convertNumbers(await market.leverage.createLoanMaxRecv(userCollateral, userBorrowed, range))
    }
    if (market.leverageV2.hasLeverage()) {
      return convertNumbers(await market.leverageV2.createLoanMaxRecv(userCollateral, userBorrowed, range))
    }

    assert(!+userBorrowed, `userBorrowed must be 0 for non-leverage mint markets`)
    const result = await market.leverage.createLoanMaxRecv(userCollateral, range)
    const { maxBorrowable, maxCollateral, leverage, routeIdx } = result
    return convertNumbers({ maxDebt: maxBorrowable, maxTotalCollateral: maxCollateral, maxLeverage: '9' })
  },
  staleTime: '1m',
  validationSuite: maxReceiveValidation,
})
