import { LOAD_TIMEOUT } from '@/support/ui'

describe('Basic Access Test', () => {
  it('should open the LlamaLend DApp successfully', () => {
    cy.visit('/llamalend/')
    cy.title(LOAD_TIMEOUT).should('include', 'LlamaLend')
  })

  it('should redirect from the old lend URL to new llamalend URL', () => {
    cy.visit('/lend/')
    cy.url(LOAD_TIMEOUT).should('match', /http:\/\/localhost:\d+\/llamalend\/ethereum\/lend-markets\/$/)
    cy.title().should('equal', 'Lend Markets - Curve LlamaLend')
  })

  it('should redirect from the old lend markets URL', () => {
    cy.visit('/lend/ethereum/markets')
    cy.url(LOAD_TIMEOUT).should('match', /http:\/\/localhost:\d+\/llamalend\/ethereum\/lend-markets\/$/)
    cy.title().should('equal', 'Lend Markets - Curve LlamaLend')
  })

  it('should redirect from the old hash URL successfully', () => {
    cy.visit('/lend/#/ethereum')
    cy.url(LOAD_TIMEOUT).should('match', /http:\/\/localhost:\d+\/llamalend\/ethereum\/lend-markets\/$/)
    cy.title().should('equal', 'Lend Markets - Curve LlamaLend')
  })

  it('should redirect from the old nested URL successfully', () => {
    cy.visit('/lend/#/ethereum/disclaimer?tab=lend')
    cy.url(LOAD_TIMEOUT).should('match', /http:\/\/localhost:\d+\/llamalend\/ethereum\/disclaimer\/\?tab=lend$/)
    cy.title().should('equal', 'Risk Disclaimer - Curve LlamaLend')
  })
})
