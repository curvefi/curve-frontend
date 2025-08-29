import { enforce, group, test } from 'vest'
import type { BorrowForm } from '@/llamalend/components/borrow/borrow.types'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'

export const borrowFormValidationGroup = ({ userBorrowed, userCollateral, range }: FieldsOf<BorrowForm>) =>
  group('borrowFormValidationGroup', () => {
    test('userBorrowed', 'Borrow amount is a non-negative number', () => {
      enforce(userBorrowed).isNumeric().gte(0)
    })
    test('userCollateral', 'Collateral amount is a non-negative number', () => {
      enforce(userCollateral).isNumeric().gte(0)
    })
    test('range', 'Range should be between 4 and 50', () => {
      enforce(range).isNumeric().between(4, 50)
    })
  })

export const borrowFormValidationSuite = createValidationSuite(borrowFormValidationGroup)
