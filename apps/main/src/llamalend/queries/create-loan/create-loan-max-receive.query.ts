import { getCreateLoanImplementation } from '@/llamalend/queries/create-loan/create-loan-query.helpers'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import { assert, decimal, Decimal } from '@ui-kit/utils'
import type { CreateLoanFormQuery } from '../../features/borrow/types'
import { createLoanFormValidationGroup } from '../validation/borrow.validation'

type CreateLoanMaxReceiveQuery = Omit<CreateLoanFormQuery, 'userCollateral' | 'debt'> & { userCollateral: Decimal }
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

export const maxReceiveValidation = createValidationSuite(
  ({
    chainId,
    marketId,
    userBorrowed,
    userCollateral,
    range,
    slippage,
    leverageEnabled,
  }: CreateLoanMaxReceiveParams) => {
    marketIdValidationSuite({ chainId, marketId })
    createLoanFormValidationGroup(
      { userBorrowed, userCollateral, debt: undefined, range, slippage, leverageEnabled },
      { debtRequired: false, isMaxDebtRequired: false, isLeverageRequired: false },
    )
  },
)

export const { useQuery: useCreateLoanMaxReceive, queryKey: createLoanMaxReceiveKey } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    userBorrowed = `0`,
    userCollateral = `0`,
    range,
    leverageEnabled,
  }: CreateLoanMaxReceiveParams) =>
    [
      ...rootKeys.market({ chainId, marketId }),
      'createLoanMaxRecv',
      { userBorrowed },
      { userCollateral },
      { range },
      { leverageEnabled },
    ] as const,
  queryFn: async ({
    marketId,
    userBorrowed = `0`,
    userCollateral = `0`,
    range,
    leverageEnabled,
  }: CreateLoanMaxReceiveQuery): Promise<CreateLoanMaxReceiveResult> => {
    const [type, impl] = getCreateLoanImplementation(marketId, leverageEnabled)
    switch (type) {
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
  validationSuite: maxReceiveValidation,
})
