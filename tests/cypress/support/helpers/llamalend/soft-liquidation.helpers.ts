import { LOAD_TIMEOUT, TRANSACTION_LOAD_TIMEOUT } from '@cy/support/ui'
import type { Decimal } from '@ui-kit/utils'
import { getActionValue } from './action-info.helpers'

export function writeImproveHealthForm({ amount }: { amount: Decimal }) {
  cy.get('[data-testid="improve-health-input-debt"] input[type="text"]', LOAD_TIMEOUT).as('improveHealthInput')
  cy.get('@improveHealthInput').clear()
  cy.get('@improveHealthInput').type(amount)
  cy.get('[data-testid="loan-info-accordion"] button', LOAD_TIMEOUT).first().click() // open the accordion
}

export function checkClosePositionDetailsLoaded({ debt }: { debt: Decimal }) {
  getActionValue('withdraw-amount').should('match', /(\d(\.\d+)?)/)
  getActionValue('borrow-apr').should('include', '%')
  cy.get('[data-testid="debt-to-close-position-value"]')
    .invoke('attr', 'data-value')
    .should((value) => expect(Number(value)).to.be.closeTo(Number(debt), 0.001))
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
}

export function submitImproveHealthForm() {
  cy.get('[data-testid="improve-health-submit"]', LOAD_TIMEOUT).click()
  return cy
    .get('[data-testid="toast-success"]', TRANSACTION_LOAD_TIMEOUT)
    .contains('Loan repaid', TRANSACTION_LOAD_TIMEOUT)
}

export function submitClosePositionForm() {
  cy.get('[data-testid="close-position-submit"]', LOAD_TIMEOUT).click()
  return cy
    .get('[data-testid="toast-success"]', TRANSACTION_LOAD_TIMEOUT)
    .contains('Position closed', TRANSACTION_LOAD_TIMEOUT)
}
