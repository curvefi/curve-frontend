import { LOAD_TIMEOUT } from '@cy/support/ui'

describe('Refuel page', () => {
  const visitRefuelPage = () => {
    cy.visit('/dex/ethereum/pools/factory-stable-ng-561/refuel')
    cy.get('[data-testid="refuel-page"]', LOAD_TIMEOUT).should('be.visible')
  }

  const targetRefuelPercentageInput = () => cy.get('input[name="targetRefuelPercentage"]')
  const configurationOption = (value: string) =>
    cy.get(`[data-testid="refuel-configuration"] button[value="${value}"]`)

  it('renders the refuel page', () => {
    visitRefuelPage()
  })

  it('updates target refuel percentage from configuration presets', () => {
    visitRefuelPage()

    targetRefuelPercentageInput().should('be.disabled').and('have.value', '50')

    configurationOption('tokenA').click()
    targetRefuelPercentageInput().should('be.disabled').and('have.value', '0')

    configurationOption('tokenB').click()
    targetRefuelPercentageInput().should('be.disabled').and('have.value', '100')

    configurationOption('custom').click()
    targetRefuelPercentageInput().should('be.enabled').and('have.value', '100')

    targetRefuelPercentageInput().clear().type('42').should('have.value', '42')

    configurationOption('balanced').click()
    targetRefuelPercentageInput().should('be.disabled').and('have.value', '50')
  })
})
