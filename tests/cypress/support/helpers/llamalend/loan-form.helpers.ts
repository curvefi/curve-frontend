import { submitAndExpectToast } from '@cy/support/helpers/toast.helpers'
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
  submitAndExpectToast(
    () => {
      cy.get(`[data-testid="${form}-submit-button"]`).click(TIMEOUTS['ui.interaction'])
      if (approveDelegation) {
        cy.get('[data-testid="leverage-delegation-modal"]').should('be.visible')
        cy.get('[data-testid="leverage-delegation-approve"]').click()
      }
    },
    { message },
    getTimeoutCategory('evm.confirmation', isMocked),
  )
  return cy.get('[data-testid="loan-form-errors"]').should('not.exist')
}
