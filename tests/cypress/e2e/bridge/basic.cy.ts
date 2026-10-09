import { TIMEOUTS } from '@cy/support/timeout-categories'
describe('Basic Access Test', () => {
  it('should open the Bridge page successfully', () => {
    cy.visit('/bridge/')
    cy.url(TIMEOUTS['ui.navigation']).should('match', /http:\/\/localhost:\d+\/bridge\/ethereum\/?$/)
    cy.get('[data-testid^="bridges"]', TIMEOUTS['ui.render']).should('be.visible')
  })
})
