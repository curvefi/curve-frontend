import { oneOf } from '@cy/support/generators'
import { LOAD_TIMEOUT } from '@cy/support/ui'

describe('Basic Access Test', () => {
  const path = oneOf('/', '/dex')

  it('should support default networks if the lite API is offline', () => {
    cy.intercept(`https://api-core.curve.finance/v1/getPlatforms`, { status: 500 }).as('error')
    cy.visit('/dex/corn/pools')
    cy.wait('@error', LOAD_TIMEOUT)
    cy.title(LOAD_TIMEOUT).should('equal', 'Pools - Curve')
    cy.get('[data-testid="error-title"]').should('not.exist')
    cy.url().should('include', '/dex/ethereum/pools')
  })

  it(`should open the Main DApp successfully at ${path}`, () => {
    cy.visit(path)
    cy.title(LOAD_TIMEOUT).should('equal', 'Pools - Curve')
    cy.url().should('include', '/dex')
  })

  it(`should redirect from the old URL successfully at ${path}`, () => {
    cy.visit(`${path}#/ethereum/create-pool`)
    cy.title(LOAD_TIMEOUT).should('equal', 'Create Pool - Curve')
    cy.url().should('match', /http:\/\/localhost:\d+\/dex\/ethereum\/create-pool\/?$/)
  })

  it('should redirect from the old integrations URL successfully', () => {
    cy.visit(`${path.replace('/', '')}${oneOf('', '#')}/integrations`)
    cy.title(LOAD_TIMEOUT).should('equal', 'Integrations - Curve')
    cy.url().should('match', /http:\/\/localhost:\d+\/dex\/ethereum\/integrations\/?$/)
  })

  it('should show an error page on 404', () => {
    cy.visit('/non-existing-page', { failOnStatusCode: false })
    cy.get('[data-testid="error-subtitle"]').should('contain.text', 'Page Not Found')
  })

  it('should load for lite networks', () => {
    cy.visit('/dex/corn/pools')
    cy.title(LOAD_TIMEOUT).should('equal', 'Pools - Curve')
    cy.url().should('include', '/dex/corn/pools')
    cy.contains('CORN/wBTCN', LOAD_TIMEOUT).should('be.visible')
  })
})
