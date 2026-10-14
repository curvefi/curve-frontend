import { TIMEOUTS } from '@cy/support/timeout-categories'
describe('Basic Access Test', () => {
  it('should open the DAO DApp successfully', () => {
    cy.visit('/dao')
    cy.title(TIMEOUTS['ui.navigation']).should('include', 'Proposals')
  })
})
