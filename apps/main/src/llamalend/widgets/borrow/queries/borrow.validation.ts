import { enforce, group, test } from 'vest'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { llamaApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { type BorrowForm, type BorrowFormQueryParams } from '../borrow.types'
import { BORROW_PRESET_RANGES } from '../borrow.util'

const validateUserBorrowed = (userBorrowed: number | null | undefined) =>
  test('userBorrowed', 'Borrow amount is a non-negative number', () => {
    enforce(userBorrowed).isNumeric().gte(0)
  })

const balidateUserCollateral = (userCollateral: number | undefined | null) =>
  test('userCollateral', 'Collateral amount is a non-negative number', () => {
    enforce(userCollateral).isNumeric().gte(0)
  })

const validateDebt = (debtRequired: boolean, debt: number | undefined | null) =>
  test('debt', `Debt should be a non-negative number${debtRequired ? '' : ' or null'}`, () => {
    if (debtRequired || debt != null) {
      enforce(debt).isNumeric().gte(0)
    }
  })

const validateLeverage = (leverage: number | undefined | null) =>
  test('leverage', 'Leverage should be a number greater than or equal to 1', () => {
    if (leverage != null) {
      enforce(leverage).isNumeric().gte(1)
    }
  })

const validateSlippage = (slippage: number | null | undefined) =>
  test('slippage', 'Slippage should be a number between 0 and 100', () => {
    enforce(slippage).isNumeric().gte(0).lte(100)
  })

export const validateRange = (range: number | null | undefined, { MaxLtv, Safe } = BORROW_PRESET_RANGES) =>
  test('range', `Range should be number between ${MaxLtv} and ${Safe}`, () => {
    enforce(range).isNumeric().gte(MaxLtv).lte(Safe)
  })

export const borrowFormValidationGroup = (
  { userBorrowed, userCollateral, debt, leverage, range, slippage }: FieldsOf<BorrowForm>,
  { debtRequired = true }: { debtRequired?: boolean } = {},
) =>
  group('borrowFormValidationGroup', () => {
    validateUserBorrowed(userBorrowed)
    balidateUserCollateral(userCollateral)
    validateDebt(debtRequired, debt)
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
