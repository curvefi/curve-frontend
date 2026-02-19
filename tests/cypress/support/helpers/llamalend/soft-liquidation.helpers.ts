import { LOAD_TIMEOUT, TRANSACTION_LOAD_TIMEOUT } from '@cy/support/ui'
import type { AlertColor } from '@mui/material/Alert'
import type { Decimal } from '@ui-kit/utils'
import { getActionValue } from './action-info.helpers'

export function writeImproveHealthForm({ amount }: { amount: Decimal }) {
  cy.get('[data-testid="improve-health-input-debt"] input[type="text"]', LOAD_TIMEOUT).as('improveHealthInput')
  cy.get('@improveHealthInput').clear()
  cy.get('@improveHealthInput').type(amount)
}

export function checkClosePositionDetailsLoaded({ debt }: { debt: Decimal }) {
  getActionValue('debt-to-close-position').should('match', /(\d(\.\d+)?)/) // first check the number is displayed before converting to number
  getActionValue('debt-to-close-position')
    .then((val) => Number(val))
    .should('be.closeTo', Number(debt), Number(debt) * 0.01)
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
  getActionValue('withdraw-amount').should('match', /(\d(\.\d+)?)/)
}

export function submitImproveHealthForm() {
  cy.get('[data-testid="improve-health-submit-button"]', LOAD_TIMEOUT).click()
  return cy
    .get('[data-testid="toast-success"]', TRANSACTION_LOAD_TIMEOUT)
    .contains('Loan repaid', TRANSACTION_LOAD_TIMEOUT)
}

export function submitClosePositionForm(expected: AlertColor = 'success', message = 'Position closed') {
  cy.get('[data-testid="close-position-submit-button"]', LOAD_TIMEOUT).click()
  return cy
    .get(`[data-testid="toast-${expected}"]`, TRANSACTION_LOAD_TIMEOUT)
    .contains(message, TRANSACTION_LOAD_TIMEOUT)
}
