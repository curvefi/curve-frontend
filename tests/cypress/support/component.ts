import { mount } from 'cypress/react'

Cypress.Commands.add('mount', (component, options) => mount(component, options))
