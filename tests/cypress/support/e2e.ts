import '@cy/eip6963-test-setup'
import type { AppRoute } from './routes'

/** Global Cypress exception handler to ignore specific known errors. */
Cypress.on(
  'uncaught:exception',
  (error) =>
    // Reverted transaction errors are passed as a prop, React DevTools tries to serialize that and fails.
    !error?.message?.includes('Do not know how to serialize a BigInt'),
)

declare global {
  interface Window {
    CypressNoTestConnector?: string
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-explicit-any
    interface Chainable<Subject = any> {
      visitWithoutTestConnector(route: AppRoute, options?: Partial<Cypress.VisitOptions>): Chainable<AUTWindow>
    }
  }
}

/**
 * For most of our e2e tests we have a wagmi test connect that auto-connects, so there's a wallet available.
 * However, in some cases we want to test functionality without a wallet connected.
 */
Cypress.Commands.add('visitWithoutTestConnector', (route: AppRoute, options?: Partial<Cypress.VisitOptions>) =>
  cy.visit(`/${route}`, {
    ...options,
    onBeforeLoad(win) {
      win.CypressNoTestConnector = 'true'
      options?.onBeforeLoad?.(win)
    },
  }),
)
