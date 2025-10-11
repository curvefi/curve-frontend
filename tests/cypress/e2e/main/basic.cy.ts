import { oneOf } from '@cy/support/generators'
import { LOAD_TIMEOUT } from '@cy/support/ui'

describe('Basic Access Test', () => {
  const path = oneOf('/', '/dex')

  // note: this is moved to be the first in the file, as firefox might cache the 200 response from other tests
  it('should show an error page on 500', () => {
    // note: app should work without lite networks, but that's not the case, so test error boundary with it
    cy.intercept(`https://api-core.curve.finance/v1/getPlatforms`, { statusCode: 500 }).as('error')
    cy.visit('/dex/ethereum/pools', { failOnStatusCode: false })
    cy.wait('@error')
    cy.get('[data-testid="error-title"]', LOAD_TIMEOUT).should('contain.text', 'Layout error')
    cy.get('[data-testid="retry-error-button"]').click()
    cy.wait('@error') // error called again
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
})
