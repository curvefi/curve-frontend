import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { llamaApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import type { BorrowFormQuery } from '../borrow.types'
import { getLlamaMarket } from '../llama.util'
import { borrowFormValidationGroup } from './borrow.validation'

type BorrowMaxReceiveQuery = Omit<BorrowFormQuery, 'userCollateral' | 'debt'> & { userCollateral: number }
type BorrowMaxReceiveParams = FieldsOf<BorrowMaxReceiveQuery>

type BorrowMaxReceiveResult = {
  maxDebt: number
  maxTotalCollateral?: number
  maxLeverage?: number
  userCollateral?: number
  collateralFromUserBorrowed?: number
  collateralFromMaxDebt?: number
  avgPrice?: number
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
  maxDebt: +maxDebt,
  maxLeverage: maxLeverage == null ? undefined : +maxLeverage,
  maxTotalCollateral: maxTotalCollateral == null ? undefined : +maxTotalCollateral,
  avgPrice: avgPrice == null ? undefined : +avgPrice,
  userCollateral: userCollateral == null ? undefined : +userCollateral,
  collateralFromUserBorrowed: collateralFromUserBorrowed == null ? undefined : +collateralFromUserBorrowed,
  collateralFromMaxDebt: collateralFromMaxDebt == null ? undefined : +collateralFromMaxDebt,
})

export const maxReceiveValidation = createValidationSuite(
  ({ chainId, userBorrowed, userCollateral, leverage, range, slippage }: BorrowMaxReceiveParams) => {
    chainValidationGroup({ chainId })
    llamaApiValidationGroup({ chainId })
    borrowFormValidationGroup(
      { userBorrowed, userCollateral, debt: undefined, leverage, range, slippage },
      { debtRequired: false },
    )
  },
)

export const { useQuery: useMaxBorrowReceive, queryKey: maxBorrowReceiveKey } = queryFactory({
  queryKey: ({ chainId, poolId, userBorrowed = 0, userCollateral = 0, leverage, range }: BorrowMaxReceiveParams) =>
    [
      ...rootKeys.pool({ chainId, poolId }),
      'max-borrow-receive-v1',
      { userBorrowed },
      { userCollateral },
      { leverage },
      { range },
    ] as const,
  queryFn: async ({
    poolId,
    userBorrowed = 0,
    userCollateral = 0,
    leverage,
    range,
  }: BorrowMaxReceiveQuery): Promise<BorrowMaxReceiveResult> => {
    const market = getLlamaMarket(poolId)
    if (!leverage) {
      return convertNumbers({ maxDebt: await market.createLoanMaxRecv(userCollateral, range) })
    }
    if (market instanceof LendMarketTemplate) {
      return convertNumbers(await market.leverage.createLoanMaxRecv(userCollateral, userBorrowed, range))
    }
    if (market.leverageV2.hasLeverage()) {
      return convertNumbers(await market.leverageV2.createLoanMaxRecv(userCollateral, userBorrowed, range))
    }

    console.assert(userBorrowed === 0, `userBorrowed must be 0 for non-leverage mint markets`)
    const result = await market.leverage.createLoanMaxRecv(userCollateral, range)
    const { maxBorrowable, maxCollateral, leverage: currentLeverage, routeIdx } = result
    return convertNumbers({ maxDebt: maxBorrowable, maxTotalCollateral: maxCollateral, maxLeverage: '9' })
  },
  staleTime: '1m',
  validationSuite: maxReceiveValidation,
})
