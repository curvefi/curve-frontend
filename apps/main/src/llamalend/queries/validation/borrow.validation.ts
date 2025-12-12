import { group } from 'vest'
import type { Suite } from 'vest'
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
import { type BorrowForm, type BorrowFormQueryParams } from '../../features/borrow/types'

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
    debtRequired = true,
    isMaxDebtRequired = false,
    isLeverageRequired = false,
  }: { debtRequired?: boolean; isMaxDebtRequired?: boolean; isLeverageRequired?: boolean } = {},
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

export const borrowFormValidationSuite = createValidationSuite(borrowFormValidationGroup)

export const borrowQueryValidationSuite = ({
  debtRequired,
  isMaxDebtRequired = debtRequired,
  isLeverageRequired = false,
}: {
  debtRequired: boolean
  isMaxDebtRequired?: boolean
  isLeverageRequired?: boolean
}): Suite<keyof BorrowFormQueryParams, string> =>
  createValidationSuite((params: BorrowFormQueryParams & { maxDebt?: FieldsOf<BorrowForm>['maxDebt'] }) => {
    const { chainId, leverageEnabled, marketId, userBorrowed, userCollateral, debt, range, slippage, maxDebt } = params
    marketIdValidationSuite({ chainId, marketId })
    borrowFormValidationGroup(
      { userBorrowed, userCollateral, debt, range, slippage, leverageEnabled, maxDebt },
      { debtRequired, isMaxDebtRequired, isLeverageRequired },
    )
  }) as Suite<keyof BorrowFormQueryParams, string>
