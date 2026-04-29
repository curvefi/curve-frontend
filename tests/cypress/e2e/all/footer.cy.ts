import { allViewports, LOAD_TIMEOUT, oneAppPath } from '@cy/support/ui'

describe('Footer', () => {
  allViewports().forEach(([width, height]) => {
    it(`should contain multiple links on ${width}x${height} viewport`, () => {
      cy.viewport(width, height)
      cy.visit(`/${oneAppPath()}`)
      cy.get(`[data-testid='footer']`, LOAD_TIMEOUT).should('be.visible')
      cy.get("[data-testid='footer'] a")
        .should('have.length.at.least', 1)
        .each($link => {
          cy.wrap($link).should('have.attr', 'href').and('not.be.empty')
        })
    })
  })
})
