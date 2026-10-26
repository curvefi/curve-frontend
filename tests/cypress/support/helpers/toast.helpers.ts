import { type TimeoutCategory, TIMEOUTS } from '@cy/support/timeout-categories'
import { toArray } from '@primitives/array.utils'

export type ToastOptions = {
  type?: 'success' | 'error'
  message: string
  /** Exact intermediate success messages allowed when approval is needed. */
  approvalMessage?: string | readonly string[]
}

/** Wait for previous notifications to disappear before submitting another transaction. */
const expectNoToast = () => cy.get('[data-testid^="toast-"]', TIMEOUTS['ui.render']).should('not.exist')

/** Wait for a transaction outcome, then immediately check its type and message. */
const expectToast = ({ type = 'success', message, approvalMessage }: ToastOptions, timeoutCategory: TimeoutCategory) =>
  cy
    .get('[data-testid="toast-success"], [data-testid="toast-error"]', TIMEOUTS[timeoutCategory])
    // Approval toasts may remain alongside the outcome. Only skip the explicitly allowed messages.
    .filter(
      (_, { textContent }) => !toArray(approvalMessage).some(approval => textContent.includes(approval)),
      TIMEOUTS[timeoutCategory],
    )
    .should('be.visible')
    .filter(`[data-testid="toast-${type}"]`, { timeout: 0 }) // Once outcome appears, fail immediately if its type or message is unexpected
    .should('have.length', 1)
    .and('contain.text', message)

/**
 * The success toast shows before the mutation's `onSuccess` (user events, invalidations) finishes, and the form button
 * stays pending until then. Ending a test with those intercepted requests in flight makes Chrome reload the spec.
 */
const expectFormSettled = (timeoutCategory: TimeoutCategory) =>
  cy.contains('button', 'Processing...', TIMEOUTS[timeoutCategory]).should('not.exist')

/** Wait for previous notifications, submit, verify the transaction outcome, then wait for the form to settle. */
export const submitAndExpectToast = <T>(
  submit: () => Cypress.Chainable<T> | void,
  options: ToastOptions,
  timeoutCategory: TimeoutCategory,
) =>
  expectNoToast()
    .then(() => {
      submit()
    })
    .then(() => expectToast(options, timeoutCategory))
    .then(() => expectFormSettled(timeoutCategory))
