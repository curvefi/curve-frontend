import { enforce, group, test } from 'vest'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { llamaApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { PreciseNumber, stringNumber } from '@ui-kit/utils'
import { BORROW_PRESET_RANGES } from '../constants'
import { type BorrowForm, type BorrowFormQueryParams } from '../types'

const validateUserBorrowed = (userBorrowed: PreciseNumber | null | undefined) =>
  test('userBorrowed', 'Borrow amount must be a non-negative number', () => {
    enforce(stringNumber(userBorrowed)).isNumeric().gte(0)
  })

const validateUserCollateral = (userCollateral: PreciseNumber | null | undefined) =>
  test('userCollateral', `Collateral amount must be a positive number`, () => {
    enforce(stringNumber(userCollateral)).isNumeric().gt(0)
  })

const validateDebt = (debt: PreciseNumber | null | undefined, required: boolean) =>
  test('debt', `Debt must be a positive number${required ? '' : ' or null'}`, () => {
    if (required || debt != null) {
      enforce(stringNumber(debt)).isNumeric().gt(0)
    }
  })

const validateSlippage = (slippage: PreciseNumber | null | undefined) =>
  test('slippage', 'Slippage must be a number between 0 and 100', () => {
    enforce(stringNumber(slippage)).isNumeric().gte(0).lte(100)
  })

export const validateRange = (range: number | null | undefined, { MaxLtv, Safe } = BORROW_PRESET_RANGES) => {
  test('range', `Range must be number between ${MaxLtv} and ${Safe}`, () => {
    enforce(range).isNumeric().gte(MaxLtv).lte(Safe)
  })
}

export const validateMaxDebt = (debt: PreciseNumber | null | undefined, maxDebt: PreciseNumber | null | undefined) => {
  test('debt', 'Debt must be less than or equal to maximum borrowable amount', () => {
    if (debt != null && maxDebt != null) {
      enforce(stringNumber(debt)).lte(maxDebt)
    }
  })
}

export const validateMaxCollateral = (
  userCollateral: PreciseNumber | null | undefined,
  maxCollateral: PreciseNumber | null | undefined,
) => {
  test('userCollateral', 'Collateral must be less than or equal to your wallet balance', () => {
    if (userCollateral != null && maxCollateral != null) {
      enforce(stringNumber(userCollateral)).lte(stringNumber(maxCollateral))
    }
  })
}

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
