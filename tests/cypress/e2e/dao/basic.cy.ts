import { LOAD_TIMEOUT } from '@/support/ui'

describe('Basic Access Test', () => {
  it('should open the DAO DApp successfully', () => {
    cy.visit('/dao')
    cy.title(LOAD_TIMEOUT).should('include', 'Proposals')
  })

  it(`should redirect from the old URL successfully`, () => {
    cy.visit(`/dao/#/ethereum/gauges`)
    cy.title(LOAD_TIMEOUT).should('equal', 'Gauges - Curve')
    cy.url().should('match', /http:\/\/localhost:\d+\/dao\/ethereum\/gauges\/$/)
  })
})
