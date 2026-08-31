import '@evm-ui/eip6963-test-setup'
import { skipTestsAfterFailure } from '@cy/support/ui'
import type { AppRoute } from './routes'

/** Global Cypress exception handler to ignore specific known errors. */
Cypress.on(
  'uncaught:exception',
  (
    error, // Reverted transaction errors are passed as a prop, React DevTools tries to serialize that and fails.
  ) => !error?.message?.includes('Do not know how to serialize a BigInt'),
)

/**
 * For most of our e2e tests we have a wagmi test connect that auto-connects, so there's a wallet available.
 * However, in some cases we want to test functionality without a wallet connected.
 */
Cypress.Commands.add('visitWithoutTestConnector', (route: AppRoute, options?: Partial<Cypress.VisitOptions>) =>
  cy.visit(`/${route.replace(/^\//, '')}`, {
    ...options,
    onBeforeLoad(win) {
      win.CypressNoTestConnector = 'true'
      options?.onBeforeLoad?.(win)
    },
  }),
)

/** Types of some cypress internals we use to force a blank page */
const _Cypress = Cypress as unknown as {
  state(name: 'window'): Window | undefined
  action(event: string, ...args: unknown[]): void
}

/**
 * Firefox can sometimes reload the previous test's page while loading a new one, causing flaky tests.
 * After each test, we now force the page to about:blank by using cypress internals.
 * @see PR #3093 for diagnostics code that proves the issue.
 */
const ensureTestExited = () =>
  _Cypress.state('window')?.location.href === 'about:blank' ||
  new Cypress.Promise<void>(resolve => {
    cy.once('window:load', () => resolve())
    _Cypress.action('cy:url:changed', '')
    _Cypress.action('cy:visit:blank', { testIsolation: true })
  })

/** Install the cypress internals to force a blank page after each test */
afterEach(() => Cypress.isBrowser('firefox') && cy.then(ensureTestExited))

if (Cypress.config('isInteractive')) {
  skipTestsAfterFailure()
}
