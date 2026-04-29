import { submitLoanForm } from '@cy/support/helpers/llamalend/create-loan.helpers'
import type { Decimal } from '@primitives/decimal.utils'
import { DECIMAL_REGEX } from './action-info.helpers'

export function checkClosePositionDetailsLoaded({ debt }: { debt: Decimal }) {
  cy.get('[data-testid="outstanding-debt"]').invoke('text').should('match', DECIMAL_REGEX) // first check the number is displayed before converting to number
  cy.get('[data-testid="outstanding-debt"]')
    .invoke('text')
    .then(val => Number(val.match(/[\d.]+/)?.[0])) // parse the first number
    .should('be.closeTo', Number(debt), Number(debt) * 0.01)
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
  cy.get('[data-testid="you-recover"]').invoke('text').should('match', DECIMAL_REGEX)
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
}

export const submitClosePositionForm = (expected: 'success' | 'error' = 'success') =>
  submitLoanForm({
    form: 'close-position',
    message: { success: 'Position closed successfully!', error: 'Transaction failed' }[expected],
    expected,
  })
