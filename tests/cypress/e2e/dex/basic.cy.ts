import { zeroAddress } from 'viem'
import { oneOf } from '@cy/support/generators'
import { TIMEOUTS } from '@cy/support/timeout-categories'

describe('Basic Access Test', () => {
  const path = oneOf('/', '/dex', '/dex/ethereum')
  const {
    address: poolAddress,
    title,
    message,
  } = oneOf(
    { address: '404', title: 'Unexpected Error', message: 'Invalid pool address' },
    { address: zeroAddress, title: '404', message: 'Pool Not Found' },
  )

  it('should support default networks if the lite API is offline', () => {
    cy.intercept('https://api2.curve.finance/get_platforms', { statusCode: 500 }).as('error')
    cy.visit('/dex/plasma/pools?foo=derp')
    cy.wait('@error', TIMEOUTS['mock.curveLite.platforms'])
    cy.title(TIMEOUTS['ui.navigation']).should('equal', 'Pools - Curve')
    cy.get('[data-testid="error-title"]').should('not.exist')
    cy.url().should('include', '/dex/ethereum/pools')
    cy.location('search').should('equal', '?foo=derp')
  })

  it(`should open the DEX app successfully at ${path}`, () => {
    cy.visit(`${path}?foo=derp`)
    cy.title(TIMEOUTS['ui.navigation']).should('equal', 'Swap - Curve')
    cy.location('pathname').should('match', /^\/dex\/ethereum\/swap\/?$/)
    cy.location('search').should('equal', '?foo=derp')
  })

  it('should show an error page on 404', () => {
    cy.visit('/non-existing-page', { failOnStatusCode: false, ...TIMEOUTS['ui.pageLoad'] })
    cy.get('[data-testid="error-subtitle"]').should('contain.text', 'Page Not Found')
  })

  // todo: re-enable test once lite api is fixed
  it.skip('should load for lite networks', () => {
    cy.visitWithoutTestConnector('/dex/plasma/pools')
    cy.title(TIMEOUTS['ui.navigation']).should('equal', 'Pools - Curve')
    cy.url().should('include', '/dex/plasma/pools')
    cy.contains(/USDT0\/sUSDe/i, TIMEOUTS['curveLite.pools']).should('be.visible')
  })

  it(`shows an error on /dex/:network/pools/${poolAddress}`, () => {
    cy.visit(`/dex/ethereum/pools/${poolAddress}`, { failOnStatusCode: false })
    cy.get('[data-testid="error-title"]', TIMEOUTS['ui.render']).should('have.text', title)
    cy.get('[data-testid="error-subtitle"]').should('contain.text', message)
    cy.url().should('include', `/dex/ethereum/pools/${poolAddress}`)
    // '404' fails in the route loader, whose error page has no Continue link.
    if (poolAddress === zeroAddress) {
      cy.get('[data-testid="continue-button"]').click()
      cy.get('[data-testid="data-table-head"]', TIMEOUTS['ui.render']).should('be.visible') // on the pools list page
      cy.get('[data-testid="error-subtitle"]').should('not.exist')
    }
  })
})
