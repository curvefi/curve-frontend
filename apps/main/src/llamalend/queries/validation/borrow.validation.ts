import { group, skipWhen } from 'vest'
import { isRouterRequired } from '@/llamalend/llama.utils'
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
    const { marketId, leverageEnabled, routeId } = params
    skipWhen(!marketId, () => {
      if (!marketId) return
      const [type] = getCreateLoanImplementation(marketId, !!leverageEnabled)
      // if we don't need debt we cannot need a route, as we need a route to calculate max debt
      const routeRequired = debtRequired && !!leverageEnabled && isRouterRequired(type)
      validateRoute(routeId, routeRequired)
    })
  })
