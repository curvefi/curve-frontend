import { LOAD_TIMEOUT } from '@cy/support/ui'

describe('Basic Access Test', () => {
  it('should open the Analytics DApp successfully', () => {
    cy.visit('/analytics/')
    cy.url(LOAD_TIMEOUT).should('match', /http:\/\/localhost:\d+\/analytics\/ethereum\/home\/?$/)
    cy.get('[data-testid^="analytics-home"]', LOAD_TIMEOUT).should('be.visible')
  })
})
