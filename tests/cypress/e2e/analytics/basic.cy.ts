import { TIMEOUTS } from '@cy/support/timeout-categories'
describe('Basic Access Test', () => {
  it('should open the Analytics DApp successfully', () => {
    cy.visit('/analytics/')
    cy.url(TIMEOUTS['ui.navigation']).should('match', /http:\/\/localhost:\d+\/analytics\/ethereum\/home\/?$/)
    cy.get('[data-testid^="analytics-home"]', TIMEOUTS['ui.render']).should('be.visible')
  })
})
