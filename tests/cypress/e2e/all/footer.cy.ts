import { TIMEOUTS } from '@cy/support/timeout-categories'
import { allViewports, oneAppPath } from '@cy/support/ui'

describe('Footer', () => {
  allViewports().forEach(([width, height]) => {
    it(`should contain multiple links on ${width}x${height} viewport`, () => {
      cy.viewport(width, height)
      cy.visit(`/${oneAppPath()}`)
      cy.get(`[data-testid='footer']`, TIMEOUTS['ui.render']).should('be.visible')
      cy.get("[data-testid='footer'] a")
        .should('have.length.at.least', 1)
        .each($link => {
          cy.wrap($link).should('have.attr', 'href').and('not.be.empty')
        })
    })
  })
})
