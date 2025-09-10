import { enforce, group, test } from 'vest'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { llamaApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { type BorrowForm, type BorrowFormQueryParams } from '../borrow.types'
import { BORROW_PRESET_RANGES } from '../borrow.util'

const validateUserBorrowed = (userBorrowed: number | null | undefined) =>
  test('userBorrowed', 'Borrow amount must be a non-negative number', () => {
    enforce(userBorrowed).isNumeric().gte(0)
  })

const validateUserCollateral = (userCollateral: number | undefined | null) =>
  test('userCollateral', `Collateral amount must be a positive number`, () => {
    enforce(userCollateral).isNumeric().gt(0)
  })

const validateDebt = (debt: number | undefined | null, required: boolean) =>
  test('debt', `Debt must be a positive number${required ? '' : ' or null'}`, () => {
    if (required || debt != null) {
      enforce(debt).isNumeric().gt(0)
    }
  })

const validateLeverage = (leverage: number | undefined | null) =>
  test('leverage', 'Leverage must be a number greater than or equal to 1', () => {
    if (leverage != null) {
      enforce(leverage).isNumeric().gte(1)
    }
  })

const validateSlippage = (slippage: number | null | undefined) =>
  test('slippage', 'Slippage must be a number between 0 and 100', () => {
    enforce(slippage).isNumeric().gte(0).lte(100)
  })

export const validateRange = (range: number | null | undefined, { MaxLtv, Safe } = BORROW_PRESET_RANGES) => {
  test('range', `Range must be number between ${MaxLtv} and ${Safe}`, () => {
    enforce(range).isNumeric().gte(MaxLtv).lte(Safe)
  })
}

export const borrowFormValidationGroup = (
  { userBorrowed, userCollateral, debt, leverage, range, slippage }: FieldsOf<BorrowForm>,
  { debtRequired = true }: { debtRequired?: boolean } = {},
) =>
  group('borrowFormValidationGroup', () => {
    validateUserBorrowed(userBorrowed)
    validateUserCollateral(userCollateral)
    validateDebt(debt, debtRequired)
    validateLeverage(leverage)
    validateSlippage(slippage)
    validateRange(range)
  })

export const borrowFormValidationSuite = createValidationSuite(borrowFormValidationGroup)

export const borrowQueryValidationSuite = createValidationSuite(
  ({ chainId, userBorrowed, userCollateral, debt, range, slippage }: BorrowFormQueryParams) => {
    chainValidationGroup({ chainId })
    llamaApiValidationGroup({ chainId })
    borrowFormValidationGroup({ userBorrowed, userCollateral, debt, range, slippage }, { debtRequired: true })
  },
)
