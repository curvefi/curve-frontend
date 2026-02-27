import { group, skipWhen } from 'vest'
import {
  validateDebt,
  validateLeverageEnabled,
  validateMaxCollateral,
  validateMaxDebt,
  validateRange,
  validateUserBorrowed,
  validateUserCollateral,
} from '@/llamalend/queries/validation/borrow-fields.validation'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { validateSlippage } from '@ui-kit/lib/model'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import { type CreateLoanDebtParams, type CreateLoanForm } from '../../features/borrow/types'

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
  createValidationSuite((params: CreateLoanDebtParams) => {
    const { chainId, leverageEnabled, marketId, userBorrowed, userCollateral, debt, range, slippage, maxDebt } = params
    skipWhen(skipMarketValidation, () => {
      marketIdValidationSuite({ chainId, marketId })
    })
    createLoanFormValidationGroup(
      { userBorrowed, userCollateral, debt, range, slippage, leverageEnabled, maxDebt },
      { debtRequired, isMaxDebtRequired, isLeverageRequired },
    )
  })
