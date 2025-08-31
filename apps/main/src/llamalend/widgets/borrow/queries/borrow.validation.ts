import { enforce, group, test } from 'vest'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { llamaApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { type BorrowForm, RANGE_MAX_SAFETY, RANGE_MAX_BORROW, type BorrowFormQueryParams } from '../borrow.types'

export const borrowFormValidationGroup = (
  { userBorrowed, userCollateral, debt, range }: FieldsOf<BorrowForm>,
  { debtRequired = true }: { debtRequired?: boolean } = {},
) =>
  group('borrowFormValidationGroup', () => {
    test('userBorrowed', 'Borrow amount is a non-negative number', () => {
      enforce(userBorrowed).isNumeric().gte(0)
    })
    test('userCollateral', 'Collateral amount is a non-negative number', () => {
      enforce(userCollateral).isNumeric().gte(0)
    })
    test('debt', `Debt should be a non-negative number${debtRequired ? '' : ' or null'}`, () => {
      if (debtRequired || debt != null) {
        enforce(debt).isNumeric().gte(0)
      }
    })
    test('range', `Range should be number between ${RANGE_MAX_BORROW} and ${RANGE_MAX_SAFETY}`, () => {
      if (!range) console.trace('range is', range)
      enforce(range).isNumeric().gte(RANGE_MAX_BORROW).lte(RANGE_MAX_SAFETY)
    })
  })

export const borrowFormValidationSuite = createValidationSuite(borrowFormValidationGroup)

export const borrowQueryValidationSuite = createValidationSuite(
  ({ chainId, userBorrowed, userCollateral, debt, range }: BorrowFormQueryParams) => {
    llamaApiValidationGroup({ chainId })
    borrowFormValidationGroup({ userBorrowed, userCollateral, debt, range }, { debtRequired: true })
  },
)
