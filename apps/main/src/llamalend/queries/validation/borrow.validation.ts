import { group } from 'vest'
import {
  validateDebt,
  validateMaxCollateral,
  validateMaxDebt,
  validateRange,
  validateSlippage,
  validateUserBorrowed,
  validateUserCollateral,
} from '@/llamalend/queries/validation/borrow-fields.validation'
import { llamaMarketValidationGroup } from '@/llamalend/queries/validation/llama.validation'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { type BorrowForm, type BorrowFormQueryParams } from '../../features/borrow/types'

export const borrowFormValidationGroup = (
  { userBorrowed, userCollateral, debt, range, slippage, maxDebt, maxCollateral }: FieldsOf<BorrowForm>,
  { debtRequired = true }: { debtRequired?: boolean } = {},
) =>
  group('borrowFormValidationGroup', () => {
    validateUserBorrowed(userBorrowed)
    validateUserCollateral(userCollateral)
    validateDebt(debt, debtRequired)
    validateSlippage(slippage)
    validateRange(range)
    validateMaxDebt(debt, maxDebt)
    validateMaxCollateral(userCollateral, maxCollateral)
  })

export const borrowFormValidationSuite = createValidationSuite(borrowFormValidationGroup)

export const borrowQueryValidationSuite = createValidationSuite(
  ({
    chainId,
    leverageEnabled,
    marketId,
    userBorrowed,
    userCollateral,
    debt,
    range,
    slippage,
  }: BorrowFormQueryParams) => {
    llamaMarketValidationGroup({ chainId, marketId })
    borrowFormValidationGroup(
      { userBorrowed, userCollateral, debt, range, slippage, leverageEnabled },
      { debtRequired: true },
    )
  },
)
