import { LOAD_TIMEOUT } from '@cy/support/ui'

describe('Basic Access Test', () => {
  it('should open the Lend DApp successfully', () => {
    cy.visit('/lend/')
    cy.url(LOAD_TIMEOUT).should('match', /http:\/\/localhost:\d+\/llamalend\/ethereum\/markets\/?$/)
  })

  it('should redirect from the old root URL successfully', () => {
    cy.visit('/lend/#/ethereum')
    cy.url(LOAD_TIMEOUT).should('match', /http:\/\/localhost:\d+\/llamalend\/ethereum\/markets\/?$/)
  })

  it('should redirect from the old nested URL successfully', () => {
    cy.visit('/lend/#/ethereum/disclaimer?tab=lend')
    cy.url(LOAD_TIMEOUT).should('match', /http:\/\/localhost:\d+\/lend\/ethereum\/legal\/?\?tab=disclaimers$/)
    cy.title().should('equal', 'Legal - Curve')
  })

  it('should open a lend market page succesfully', () => {
    cy.visit('/lend/ethereum/markets/0x23F5a668A9590130940eF55964ead9787976f2CC') // some WETH lend market on ethereum
    cy.get('[data-testid^="detail-page-layout"]', LOAD_TIMEOUT).should('be.visible')
  })
})
