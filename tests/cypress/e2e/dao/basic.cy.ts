import { LOAD_TIMEOUT } from '@cy/support/ui'

describe('Basic Access Test', () => {
  it('should open the DAO DApp successfully', () => {
    cy.visit('/dao')
    cy.title(LOAD_TIMEOUT).should('include', 'Proposals')
  })
})
