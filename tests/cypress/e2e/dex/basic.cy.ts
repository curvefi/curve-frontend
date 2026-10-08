import { oneOf } from '@cy/support/generators'
import { API_LOAD_TIMEOUT, LOAD_TIMEOUT } from '@cy/support/ui'

describe('Basic Access Test', () => {
  const path = oneOf('/', '/dex', '/dex/ethereum')

  it('should support default networks if the lite API is offline', () => {
    cy.intercept(`https://api-core.curve.finance/v1/getPlatforms`, { status: 500 }).as('error')
    cy.visit('/dex/plasma/pools?foo=derp')
    cy.wait('@error', LOAD_TIMEOUT)
    cy.title(LOAD_TIMEOUT).should('equal', 'Pools - Curve')
    cy.get('[data-testid="error-title"]').should('not.exist')
    cy.url().should('include', '/dex/ethereum/pools')
    cy.location('search').should('equal', '?foo=derp')
  })

  it(`should open the DEX app successfully at ${path}`, () => {
    cy.visit(`${path}?foo=derp`)
    cy.title(LOAD_TIMEOUT).should('equal', 'Swap - Curve')
    cy.location('pathname').should('match', /^\/dex\/ethereum\/swap\/?$/)
    cy.location('search').should('equal', '?foo=derp')
  })

  it('should show an error page on 404', () => {
    cy.visit('/non-existing-page', { failOnStatusCode: false, ...LOAD_TIMEOUT })
    cy.get('[data-testid="error-subtitle"]').should('contain.text', 'Page Not Found')
  })

  // todo: re-enable test once lite api is fixed
  it.skip('should load for lite networks', () => {
    cy.visitWithoutTestConnector('dex/plasma/pools')
    cy.title(LOAD_TIMEOUT).should('equal', 'Pools - Curve')
    cy.url().should('include', '/dex/plasma/pools')
    cy.contains(/USDT0\/sUSDe/i, API_LOAD_TIMEOUT).should('be.visible')
  })

  it('shows 404 on /dex/:network/pools/404', () => {
    cy.visit('/dex/ethereum/pools/404', { failOnStatusCode: false })
    cy.get('[data-testid="error-subtitle"]', LOAD_TIMEOUT).should('contain.text', 'Not Found')
    cy.url().should('include', '/dex/ethereum/pools/404')
    cy.get('[data-testid="continue-button"]').click()
    cy.get('[data-testid="data-table-head"]', LOAD_TIMEOUT).should('be.visible') // on the pools list page
    cy.get('[data-testid="error-subtitle"]').should('not.exist')
  })
})
