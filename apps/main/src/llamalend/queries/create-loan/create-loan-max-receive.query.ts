import { getCreateLoanImplementation } from '@/llamalend/queries/create-loan/create-loan-query.helpers'
import type { Address } from '@curvefi/prices-api'
import { getExpectedFn } from '@ui-kit/entities/router-api.query'
import { type FieldsOf } from '@ui-kit/lib'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { assert, decimal, Decimal } from '@ui-kit/utils'
import type { CreateLoanFormQuery } from '../../features/borrow/types'
import { createLoanQueryValidationSuite } from '../validation/borrow.validation'

type CreateLoanMaxReceiveQuery = Omit<CreateLoanFormQuery, 'userCollateral' | 'debt'> & {
  userCollateral: Decimal
  userAddress: Address
}
type CreateLoanMaxReceiveParams = FieldsOf<CreateLoanMaxReceiveQuery>

type CreateLoanMaxReceiveResult = {
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
}: { [K in keyof CreateLoanMaxReceiveResult]: string }): CreateLoanMaxReceiveResult => ({
  maxDebt: maxDebt as Decimal,
  maxLeverage: decimal(maxLeverage),
  maxTotalCollateral: decimal(maxTotalCollateral),
  avgPrice: decimal(avgPrice),
  userCollateral: decimal(userCollateral),
  collateralFromUserBorrowed: decimal(collateralFromUserBorrowed),
  collateralFromMaxDebt: decimal(collateralFromMaxDebt),
})

export const { useQuery: useCreateLoanMaxReceive, queryKey: createLoanMaxReceiveKey } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    userAddress,
    userBorrowed = `0`,
    userCollateral = `0`,
    range,
    leverageEnabled,
    slippage,
    route,
  }: CreateLoanMaxReceiveParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'createLoanMaxRecv',
      { userBorrowed },
      { userCollateral },
      { range },
      { leverageEnabled },
      { slippage },
      { route },
    ] as const,
  queryFn: async ({
    chainId,
    marketId,
    userAddress,
    userBorrowed = `0`,
    userCollateral = `0`,
    range,
    leverageEnabled,
    slippage,
    route,
  }: CreateLoanMaxReceiveQuery): Promise<CreateLoanMaxReceiveResult> => {
    const [type, impl] = getCreateLoanImplementation(marketId, leverageEnabled)
    switch (type) {
      case 'zapV2':
        if (!route) throw new Error(`route is required for zapV2`)
        return convertNumbers(
          await impl.createLoanMaxRecv({
            userCollateral,
            userBorrowed,
            range,
            getExpected: getExpectedFn({ chainId, router: route.provider, userAddress, slippage }),
          }),
        )
      case 'V1':
      case 'V2':
        return convertNumbers(await impl.createLoanMaxRecv(userCollateral, userBorrowed, range))
      case 'V0': {
        assert(!+userBorrowed, `userBorrowed must be 0 for non-leverage mint markets`)
        const result = await impl.createLoanMaxRecv(userCollateral, range)
        const { maxBorrowable, maxCollateral } = result // leverage and routeIdx fields are unused
        return convertNumbers({ maxDebt: maxBorrowable, maxTotalCollateral: maxCollateral })
      }
      case 'unleveraged':
        return convertNumbers({ maxDebt: await impl.createLoanMaxRecv(userCollateral, range) })
    }
  },
  staleTime: '1m',
  validationSuite: createLoanQueryValidationSuite({
    debtRequired: false,
    isMaxDebtRequired: false,
    isLeverageRequired: false,
    isRouteRequired: true, // todo remove, always true
  }),
})
