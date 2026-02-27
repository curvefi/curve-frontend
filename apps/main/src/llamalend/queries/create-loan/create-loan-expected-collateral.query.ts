import { getCreateLoanImplementation } from '@/llamalend/queries/create-loan/create-loan-query.helpers'
import type { Decimal } from '@primitives/decimal.utils'
import { parseRoute as parseRoute } from '@ui-kit/entities/router-api'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { assert, decimal } from '@ui-kit/utils'
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
} = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    userBorrowed = '0',
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
      { userBorrowed },
      { debt },
      { slippage },
      { leverageEnabled },
      { maxDebt },
      { routeId },
    ] as const,
  queryFn: async ({
    marketId,
    userBorrowed = '0',
    userCollateral = '0',
    debt,
    slippage,
    leverageEnabled,
    routeId,
  }: CreateLoanDebtQuery): Promise<CreateLoanExpectedCollateralResult> => {
    const [type, impl] = getCreateLoanImplementation(marketId, leverageEnabled)
    switch (type) {
      case 'zapV2':
        return convertNumbers(
          await impl.createLoanExpectedCollateral({ userCollateral, userBorrowed, debt, ...parseRoute(routeId) }),
        )
      case 'V1':
      case 'V2':
        return convertNumbers(await impl.createLoanExpectedCollateral(userCollateral, userBorrowed, debt, +slippage))
      case 'V0': {
        assert(!+userBorrowed, `userBorrowed must be 0 for non-leverage mint markets`)
        const { collateral, leverage } = await impl.createLoanCollateral(userCollateral, debt)
        return convertNumbers({ userCollateral, leverage, totalCollateral: collateral })
      }
      case 'unleveraged':
        throw new Error('Expected collateral is only available for leveraged create loan')
    }
  },
  category: 'user',
  validationSuite: createLoanQueryValidationSuite({ debtRequired: true, isLeverageRequired: true }),
})
