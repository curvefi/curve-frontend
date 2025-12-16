import { group, skipWhen } from 'vest'
import {
  validateDebt,
  validateLeverageEnabled,
  validateMaxCollateral,
  validateMaxDebt,
  validateRange,
  validateSlippage,
  validateUserBorrowed,
  validateUserCollateral,
} from '@/llamalend/queries/validation/borrow-fields.validation'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import { type BorrowDebtParams, type BorrowForm } from '../../features/borrow/types'

export const borrowFormValidationGroup = (
  {
    userBorrowed,
    userCollateral,
    debt,
    range,
    slippage,
    maxDebt,
    maxCollateral,
    leverageEnabled,
  }: FieldsOf<BorrowForm>,
  {
    debtRequired,
    isMaxDebtRequired,
    isLeverageRequired,
  }: { debtRequired: boolean; isMaxDebtRequired: boolean; isLeverageRequired: boolean },
) =>
  group('borrowFormValidationGroup', () => {
    validateUserBorrowed(userBorrowed)
    validateUserCollateral(userCollateral)
    validateDebt(debt, debtRequired)
    validateSlippage(slippage)
    validateRange(range)
    validateMaxDebt(debt, maxDebt, isMaxDebtRequired)
    validateMaxCollateral(userCollateral, maxCollateral)
    validateLeverageEnabled(leverageEnabled, isLeverageRequired)
  })

export const borrowQueryValidationSuite = ({
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
  createValidationSuite((params: BorrowDebtParams) => {
    const { chainId, leverageEnabled, marketId, userBorrowed, userCollateral, debt, range, slippage, maxDebt } = params
    skipWhen(skipMarketValidation, () => {
      marketIdValidationSuite({ chainId, marketId })
    })
    borrowFormValidationGroup(
      { userBorrowed, userCollateral, debt, range, slippage, leverageEnabled, maxDebt },
      { debtRequired, isMaxDebtRequired, isLeverageRequired },
    )
  })
