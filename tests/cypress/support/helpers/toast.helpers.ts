import { type TimeoutCategory, TIMEOUTS } from '@cy/support/timeout-categories'

/** Wait for previous notifications to disappear before submitting another transaction. */
const expectNoToast = () => cy.get('[data-testid^="toast-"]', TIMEOUTS['ui.render']).should('not.exist')

/** Wait for a transaction outcome, then immediately check its type and message. */
const expectToast = (
  { type = 'success', message }: { type?: 'success' | 'error'; message: string },
  timeoutCategory: TimeoutCategory,
) =>
  cy
    // Approvals emit their own success toasts before the transaction outcome and can remain visible alongside it.
    .get(
      '[data-testid="toast-success"]:not(:contains("Approved ")), [data-testid="toast-error"]',
      TIMEOUTS[timeoutCategory],
    )
    .should('be.visible')
    // Once an outcome appears, fail immediately if its type or message is unexpected.
    .filter(`[data-testid="toast-${type}"]`, { timeout: 0 })
    .should('have.length', 1)
    .and('contain.text', message)

/** Wait for previous notifications, submit, then verify the transaction outcome. */
export const submitAndExpectToast = <T>(
  submit: () => Cypress.Chainable<T> | void,
  options: { type?: 'success' | 'error'; message: string },
  timeoutCategory: TimeoutCategory,
) =>
  expectNoToast()
    .then(() => {
      submit()
    })
    .then(() => expectToast(options, timeoutCategory))
