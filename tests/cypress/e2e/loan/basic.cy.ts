import { LOAD_TIMEOUT } from '@/support/ui'

describe('Basic Access Test', () => {
  it('should open the LlamaLend DApp successfully', () => {
    cy.visit('/llamalend')
    cy.title(LOAD_TIMEOUT).should('include', 'LlamaLend')
  })

  it('should redirect from the old crvusd URL to new llamalend URL', () => {
    cy.visit('/crvusd')
    cy.url(LOAD_TIMEOUT).should('match', /http:\/\/localhost:\d+\/llamalend\/ethereum\/mint-markets\/$/)
    cy.title().should('equal', 'Mint Markets - Curve LlamaLend')
  })

  it('should redirect from the old crvusd markets URL', () => {
    cy.visit('/crvusd/ethereum/markets')
    cy.url(LOAD_TIMEOUT).should('match', /http:\/\/localhost:\d+\/llamalend\/ethereum\/mint-markets\/$/)
    cy.title().should('equal', 'Mint Markets - Curve LlamaLend')
  })

  it(`should redirect from the old hash URL successfully`, () => {
    cy.visit(`/crvusd/#/ethereum/scrvUSD`)
    cy.title(LOAD_TIMEOUT).should('equal', 'Savings crvUSD - Curve')
    cy.url().should('match', /http:\/\/localhost:\d+\/llamalend\/ethereum\/scrvUSD\/$/)
  })
})
