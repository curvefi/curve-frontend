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

export const createLoanFormValidationGroup = (
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
  }: { debtRequired: boolean; isMaxDebtRequired: boolean; isLeverageRequired: boolean },
) =>
  group('createLoanFormValidationGroup', () => {
    validateUserBorrowed(userBorrowed)
    validateUserCollateral(userCollateral)
    validateDebt(debt, debtRequired)
    validateSlippage({ slippage })
    validateRange(range)
    validateMaxDebt(debt, maxDebt, isMaxDebtRequired)
    validateMaxCollateral(userCollateral, maxCollateral)
    validateLeverageEnabled(leverageEnabled, isLeverageRequired)
  })

export const createLoanQueryValidationSuite = ({
  debtRequired,
  isMaxDebtRequired = debtRequired,
  isLeverageRequired = false,
  skipMarketValidation = false,
}: {
  debtRequired: boolean
  isMaxDebtRequired?: boolean
  isLeverageRequired?: boolean
  skipMarketValidation?: boolean
}) =>
  createValidationSuite(
    ({
      chainId,
      leverageEnabled,
      marketId,
      userBorrowed,
      userCollateral,
      debt,
      range,
      slippage,
      maxDebt,
      routeId,
    }: CreateLoanDebtParams) => {
      skipWhen(skipMarketValidation, () => {
        marketIdValidationSuite({ chainId, marketId })
      })
      createLoanFormValidationGroup(
        { userBorrowed, userCollateral, debt, range, slippage, leverageEnabled, maxDebt },
        { debtRequired, isMaxDebtRequired, isLeverageRequired },
      )
      skipWhen(!marketId, () => {
        if (!marketId) return
        const [type] = getCreateLoanImplementation(marketId, !!leverageEnabled)
        // if we don't need debt we cannot need a route, as we need a route to calculate max debt
        const routeRequired = debtRequired && !!leverageEnabled && isRouterRequired(type)
        validateRoute(routeId, routeRequired)
      })
    },
  )
