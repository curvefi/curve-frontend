import { LOAD_TIMEOUT, TRANSACTION_LOAD_TIMEOUT } from '@cy/support/ui'

export function submitLoanForm({
  form,
  message,
  approveDelegation = false,
}: {
  form: string
  message: string
  approveDelegation?: boolean
}) {
  cy.get('[data-testid="toast-success"]', LOAD_TIMEOUT).should('not.exist') // wait previous confirmations are gone
  cy.get(`[data-testid="${form}-submit-button"]`).click(LOAD_TIMEOUT)
  if (approveDelegation) {
    cy.get('[data-testid="leverage-delegation-modal"]').should('be.visible')
    cy.get('[data-testid="leverage-delegation-approve"]').click()
  }
  cy.get('[data-testid="toast-success"]', TRANSACTION_LOAD_TIMEOUT).contains(message, TRANSACTION_LOAD_TIMEOUT)
  return cy.get('[data-testid="loan-form-errors"]').should('not.exist')
}
