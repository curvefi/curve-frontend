import { LOAD_TIMEOUT } from '@cy/support/ui'

describe('Basic Access Test', () => {
  it('should open the Bridge page successfully', () => {
    cy.visit('/bridge/')
    cy.url(LOAD_TIMEOUT).should('match', /http:\/\/localhost:\d+\/bridge\/ethereum\/bridges\/?$/)
    cy.get('[data-testid^="bridge-page"]', LOAD_TIMEOUT).should('be.visible')
  })
})
