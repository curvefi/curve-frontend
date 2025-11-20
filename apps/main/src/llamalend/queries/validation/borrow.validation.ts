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
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { llamaApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
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
  ({ chainId, userBorrowed, userCollateral, debt, range, slippage }: BorrowFormQueryParams) => {
    chainValidationGroup({ chainId })
    llamaApiValidationGroup({ chainId })
    borrowFormValidationGroup({ userBorrowed, userCollateral, debt, range, slippage }, { debtRequired: true })
  },
)
