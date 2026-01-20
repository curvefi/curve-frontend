import { LOAD_TIMEOUT } from '@cy/support/ui'

describe('Basic Access Test', () => {
  it('should open the crvUSD DApp successfully', () => {
    cy.visit('/crvusd')
    cy.title(LOAD_TIMEOUT).should('include', 'Markets')
  })

  it(`should redirect from the old URL successfully`, () => {
    cy.visit(`/crvusd/#/ethereum/scrvUSD`)
    cy.title(LOAD_TIMEOUT).should('equal', 'Savings crvUSD - Curve')
    cy.url().should('match', /http:\/\/localhost:\d+\/crvusd\/ethereum\/scrvUSD\/?$/)
  })

  it('should open a loan market page succesfully', () => {
    cy.visit('/crvusd/ethereum/markets/WBTC') // some WBTC mint market on ethereum
    cy.get('[data-testid^="detail-page-layout"]', LOAD_TIMEOUT).should('be.visible')
  })
})
