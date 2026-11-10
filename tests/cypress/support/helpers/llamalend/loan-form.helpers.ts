import { submitAndExpectToast } from '@cy/support/helpers/toast.helpers'
import { TIMEOUTS, getTimeoutCategory } from '@cy/support/timeout-categories'
import { notFalsy } from '@primitives/objects.utils'

export function submitLoanForm({
  form,
  message,
  approvalMessage,
  approveDelegation = false,
  isMocked = false,
}: {
  form: string
  message: string
  approvalMessage?: string
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
    { message, approvalMessage: notFalsy(approveDelegation && 'Approved leverage delegation', approvalMessage) },
    getTimeoutCategory('tenderly', 'submit', isMocked),
  )
  return cy.get('[data-testid="loan-form-errors"]').should('not.exist')
}
