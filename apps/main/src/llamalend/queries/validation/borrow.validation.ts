import { enforce, group, skipWhen, test } from 'vest'
import { isRouterRequired, tryGetMarket } from '@/llamalend/llama.utils'
import {
  validateDebt,
  validateLeverageEnabled,
  validateMaxCollateral,
  validateMaxDebt,
  validateRange,
  validateRoute,
  validateUserBorrowed,
  validateUserCollateral,
} from '@/llamalend/queries/validation/borrow-fields.validation'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { validateSlippage } from '@ui-kit/lib/model'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import { type CreateLoanDebtParams, type CreateLoanForm } from '../../features/borrow/types'
import { getCreateLoanImplementation } from '../create-loan/create-loan-query.helpers'

const createLoanFormValidationGroup = (
  {
    userBorrowed,
    userCollateral,
    debt,
    range,
    slippage,
    maxDebt,
    maxCollateral,
    leverageEnabled,
    routeId: _, // todo: we can't validate the routeId without the marketId
  }: FieldsOf<CreateLoanForm>,
  {
    debtRequired,
    isMaxDebtRequired,
    isLeverageRequired,
    collateralRequired,
    ignoreMaxCollateral,
  }: {
    debtRequired: boolean
    isMaxDebtRequired: boolean
    isLeverageRequired: boolean
    collateralRequired: boolean
    ignoreMaxCollateral: boolean
  },
) =>
  group('createLoanFormValidationGroup', () => {
    validateUserBorrowed(userBorrowed)
    validateUserCollateral(userCollateral, { required: collateralRequired })
    validateDebt(debt, { required: debtRequired })
    validateSlippage({ slippage })
    validateRange(range)
    validateMaxDebt(debt, maxDebt, { required: isMaxDebtRequired })
    if (!ignoreMaxCollateral) validateMaxCollateral(userCollateral, maxCollateral, { required: collateralRequired })
    validateLeverageEnabled(leverageEnabled, { required: isLeverageRequired })
  })

function validateCreateLoanFieldsForMarket(params: CreateLoanDebtParams, { debtRequired }: { debtRequired: boolean }) {
  const { marketId, leverageEnabled, routeId, userBorrowed } = params
  const market = tryGetMarket(marketId)
  skipWhen(!market, () => {
    const [type] = market ? getCreateLoanImplementation(market, !!leverageEnabled) : []
    // if we don't need debt we cannot need a route, as we need a route to calculate max debt
    validateRoute(routeId, !!(type && debtRequired && leverageEnabled && isRouterRequired(type)))
    skipWhen(type === 'V1' || type === 'V2' || type == null, () => {
      test('userBorrowed', `Borrow amount is not supported for creating loan ${type}`, () => {
        enforce(+(userBorrowed ?? '0')).equals(0)
      })
    })
  })
}

export const createLoanQueryValidationSuite = ({
  debtRequired,
  isMaxDebtRequired = debtRequired,
  collateralRequired = false,
  ignoreMaxCollateral = !collateralRequired,
  isLeverageRequired = false,
  skipMarketValidation = false,
}: {
  debtRequired: boolean
  ignoreMaxCollateral?: boolean
  collateralRequired?: boolean
  isMaxDebtRequired?: boolean
  isLeverageRequired?: boolean
  skipMarketValidation?: boolean
}) =>
  createValidationSuite((params: CreateLoanDebtParams) => {
    skipWhen(skipMarketValidation, () => {
      marketIdValidationSuite(params)
    })
    createLoanFormValidationGroup(params, {
      debtRequired,
      isMaxDebtRequired,
      isLeverageRequired,
      collateralRequired,
      ignoreMaxCollateral,
    })
    validateCreateLoanFieldsForMarket(params, { debtRequired })
  })
