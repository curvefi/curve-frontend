import { mount } from 'cypress/react'

Cypress.Commands.add('mount', (component, options) => mount(component, options))

beforeEach(() => {
  // Intercept default crypto image to prevent 404s in all component tests using TokenIcon component
  cy.intercept('GET', '/images/default-crypto.png', { fixture: 'images/default-crypto.png' })
})
