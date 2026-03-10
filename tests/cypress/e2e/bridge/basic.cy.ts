import { LOAD_TIMEOUT } from '@cy/support/ui'

describe('Basic Access Test', () => {
  it('should open the Bridge page successfully', () => {
    cy.visit('/bridge/')
    cy.url(LOAD_TIMEOUT).should('match', /http:\/\/localhost:\d+\/bridge\/ethereum\/?$/)
    cy.get('[data-testid^="bridges"]', LOAD_TIMEOUT).should('be.visible')
  })
})
