import { LOAD_TIMEOUT, oneAppPath, oneDesktopViewport, oneMobileViewport, oneTabletViewport } from '@cy/support/ui'

const viewports = [oneDesktopViewport(), oneTabletViewport(), oneMobileViewport()]

describe('Footer', () => {
  viewports.forEach((viewport) => {
    it(`should contain multiple links on ${viewport[0]}x${viewport[1]} viewport`, () => {
      cy.viewport(...viewport)
      cy.visit(`/${oneAppPath()}`)
      cy.get(`[data-testid='footer']`, LOAD_TIMEOUT).should('be.visible')
      cy.get("[data-testid='footer'] a")
        .should('have.length.at.least', 1)
        .each(($link) => {
          cy.wrap($link).should('have.attr', 'href').and('not.be.empty')
        })
    })
  })
})
