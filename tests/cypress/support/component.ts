import '@cy/eip6963-test-setup'
import '@/global-extensions'
import { mount } from 'cypress/react'
import { skipTestsAfterFailure } from '@cy/support/ui'

/** Global Cypress exception handler to ignore specific known errors. */
Cypress.on(
  'uncaught:exception',
  (error) =>
    // Reverted transaction errors are passed as a prop, React DevTools tries to serialize that and fails.
    !error?.message?.includes('Do not know how to serialize a BigInt'),
)

Cypress.Commands.add('mount', (component, options) => mount(component, options))

beforeEach(() => {
  // Intercept default crypto image to prevent 404s in all component tests using TokenIcon component
  cy.intercept('GET', '/images/default-crypto.png', { fixture: 'images/default-crypto.png' })
})

if (Cypress.config('isInteractive')) {
  skipTestsAfterFailure()
}
