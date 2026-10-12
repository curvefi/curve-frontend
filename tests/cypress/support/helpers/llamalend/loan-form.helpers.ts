import { TIMEOUTS, getTimeoutCategory } from '@cy/support/timeout-categories'

export function submitLoanForm({
  form,
  message,
  approveDelegation = false,
  isMocked = false,
}: {
  form: string
  message: string
  approveDelegation?: boolean
  isMocked?: boolean
}) {
  cy.get('[data-testid="toast-success"]', TIMEOUTS['ui.render']).should('not.exist') // wait previous confirmations are gone
  cy.get(`[data-testid="${form}-submit-button"]`).click(TIMEOUTS['ui.interaction'])
  if (approveDelegation) {
    cy.get('[data-testid="leverage-delegation-modal"]').should('be.visible')
    cy.get('[data-testid="leverage-delegation-approve"]').click()
  }
  cy.get('[data-testid="toast-success"]', TIMEOUTS[getTimeoutCategory('evm.confirmation', isMocked)]).contains(
    message,
    TIMEOUTS[getTimeoutCategory('evm.confirmation', isMocked)],
  )
  return cy.get('[data-testid="loan-form-errors"]').should('not.exist')
}
