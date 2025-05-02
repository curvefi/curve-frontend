import { LOAD_TIMEOUT } from '@/support/ui'

describe('Basic Access Test', () => {
  it('should open the Lend DApp successfully', () => {
    cy.visit('/lend/')
    cy.title().should('include', 'Lend')
  })

  it('should redirect from the old root URL successfully', () => {
    cy.visit('/lend/#/ethereum')
    cy.url(LOAD_TIMEOUT).should('match', /http:\/\/localhost:\d+\/lend\/ethereum\/markets\/$/)
    cy.title().should('equal', 'Markets - Curve Lend')
  })

  it('should redirect from the old nested URL successfully', () => {
    cy.visit('/lend/#/ethereum/disclaimer?tab=lend')
    cy.url(LOAD_TIMEOUT).should('match', /http:\/\/localhost:\d+\/lend\/ethereum\/disclaimer\/\?tab=lend$/)
    cy.title().should('equal', 'Risk Disclaimer - Curve Lend')
  })
})
