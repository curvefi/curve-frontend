import '@evm-ui/eip6963-test-setup'
import '@/global-extensions'
import { mount } from 'cypress/react'
import { skipTestsAfterFailure } from '@cy/support/ui'

/** Global Cypress exception handler to ignore specific known errors. */
Cypress.on(
  'uncaught:exception',
  (
    error, // Reverted transaction errors are passed as a prop, React DevTools tries to serialize that and fails.
  ) => !error?.message?.includes('Do not know how to serialize a BigInt'),
)

Cypress.Commands.add('mount', (component, options) => mount(component, options))

if (Cypress.config('isInteractive')) {
  skipTestsAfterFailure()
}
