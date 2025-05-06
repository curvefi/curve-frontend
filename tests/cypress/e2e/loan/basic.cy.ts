import { LOAD_TIMEOUT } from '@/support/ui'

describe('Basic Access Test', () => {
  it('should open the crvUSD DApp successfully', () => {
    cy.visit('/crvusd')
    cy.title(LOAD_TIMEOUT).should('include', 'Markets')
  })

  it(`should redirect from the old URL successfully`, () => {
    cy.visit(`/crvusd/#/ethereum/scrvUSD`)
    cy.title(LOAD_TIMEOUT).should('equal', 'Savings crvUSD - Curve')
    cy.url().should('match', /http:\/\/localhost:\d+\/crvusd\/ethereum\/scrvUSD\/$/)
  })
})
