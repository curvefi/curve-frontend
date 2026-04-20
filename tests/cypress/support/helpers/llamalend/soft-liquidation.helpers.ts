import { submitLoanForm } from '@cy/support/helpers/llamalend/create-loan.helpers'
import type { Decimal } from '@primitives/decimal.utils'
import { DECIMAL_REGEX, getActionValue } from './action-info.helpers'

export function checkClosePositionDetailsLoaded({ debt }: { debt: Decimal }) {
  getActionValue('debt-to-close-position').should('match', DECIMAL_REGEX) // first check the number is displayed before converting to number
  getActionValue('debt-to-close-position')
    .then((val) => Number(val))
    .should('be.closeTo', Number(debt), Number(debt) * 0.01)
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
  getActionValue('withdraw-amount').should('match', DECIMAL_REGEX)
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
}

export const submitClosePositionForm = (expected: 'success' | 'error' = 'success') =>
  submitLoanForm({
    form: 'close-position',
    message: { success: 'Position closed successfully!', error: 'Transaction failed' }[expected],
    expected,
  })
