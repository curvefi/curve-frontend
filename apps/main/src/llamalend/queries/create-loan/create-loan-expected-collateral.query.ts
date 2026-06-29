import { getCreateLoanImplementation } from '@/llamalend/queries/create-loan/create-loan-query.helpers'
import type { Decimal } from '@primitives/decimal.utils'
import { parseRoute as parseRoute } from '@ui-kit/entities/router-api'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { decimal } from '@ui-kit/utils'
import type { CreateLoanDebtParams, CreateLoanDebtQuery } from '../../features/borrow/types'
import { createLoanQueryValidationSuite } from '../validation/borrow.validation'

type CreateLoanExpectedCollateralResult = {
  totalCollateral: Decimal
  leverage: Decimal
  userCollateral: Decimal
  collateralFromUserBorrowed: Decimal | undefined
  collateralFromDebt: Decimal | undefined
  avgPrice: Decimal | undefined
}

const convertNumbers = ({
  totalCollateral,
  userCollateral,
  collateralFromUserBorrowed,
  collateralFromDebt,
  leverage,
  avgPrice,
}: {
  totalCollateral: string
  leverage: string
  userCollateral: string | number
  collateralFromUserBorrowed?: string
  collateralFromDebt?: string
  avgPrice?: string
}): CreateLoanExpectedCollateralResult => ({
  totalCollateral: totalCollateral as Decimal,
  leverage: leverage as Decimal,
  userCollateral: userCollateral as Decimal,
  avgPrice: decimal(avgPrice),
  collateralFromUserBorrowed: decimal(collateralFromUserBorrowed),
  collateralFromDebt: decimal(collateralFromDebt),
})

export const {
  useQuery: useCreateLoanExpectedCollateral,
  queryKey: createLoanExpectedCollateralQueryKey,
  invalidate: invalidateCreateLoanExpectedCollateral,
  reset: resetCreateLoanExpectedCollateral,
} = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    userCollateral = '0',
    debt,
    slippage,
    leverageEnabled,
    maxDebt,
    routeId,
  }: CreateLoanDebtParams) =>
    [
      ...rootKeys.market({ chainId, marketId }),
      'createLoanExpectedCollateral',
      { userCollateral },
      { debt },
      { slippage },
      { leverageEnabled },
      { maxDebt },
      { routeId },
    ] as const,
  queryFn: async ({
    marketId,
    userCollateral = '0',
    debt,
    slippage,
    leverageEnabled,
    routeId,
  }: CreateLoanDebtQuery): Promise<CreateLoanExpectedCollateralResult> => {
    const deprecatedBorrowedFromWallet = '0'
    const [type, impl] = getCreateLoanImplementation(marketId, leverageEnabled)
    switch (type) {
      case 'zapV2':
        return convertNumbers(await impl.createLoanExpectedCollateral({ userCollateral, debt, ...parseRoute(routeId) }))
      case 'V1':
      case 'V2':
        return convertNumbers(
          await impl.createLoanExpectedCollateral(userCollateral, deprecatedBorrowedFromWallet, debt, +slippage),
        )
      case 'V0': {
        const { collateral, leverage } = await impl.createLoanCollateral(userCollateral, debt)
        return convertNumbers({ userCollateral, leverage, totalCollateral: collateral })
      }
      case 'unleveraged':
        throw new Error('Expected collateral is only available for leveraged create loan')
    }
  },
  category: 'llamalend.createLoan',
  validationSuite: createLoanQueryValidationSuite({ debtRequired: true, isLeverageRequired: true }),
})
