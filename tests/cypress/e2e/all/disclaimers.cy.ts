import { LOAD_TIMEOUT, oneAppPath, oneDesktopViewport, oneTabletViewport, oneViewport } from '@/support/ui'

describe('Disclaimers', () => {
  describe('Footer link', () => {
    const footerViewports = [oneDesktopViewport(), oneTabletViewport()]

    footerViewports.forEach((viewport) => {
      it(`should contain footer disclaimer links for ${viewport[0]}x${viewport[1]}`, () => {
        cy.viewport(...viewport)
        cy.visit(`/${oneAppPath()}/`)

        // Navigate to risk disclaimer from footer.
        cy.get(`[data-testid='footer']`, LOAD_TIMEOUT).should('be.visible')
        cy.get(`[data-testid='footer'] a`).contains('disclaimer', { matchCase: false }).click()
        cy.url().should('match', /\/disclaimer(\?tab=(lend|crvusd))?$/)
      })
    })
  })

  describe('Navigation', () => {
    const [width, height] = oneViewport()

    it(`should contain multiple tabs for ${width}x${height}`, () => {
      cy.viewport(width, height)
      cy.visit(`/${oneAppPath()}/#/ethereum/disclaimer`)

      // Make sure there's tabs available and click one.
      cy.get(`[data-testid='disclaimer']`, LOAD_TIMEOUT).should('be.visible')

      const tabs = cy.get("[data-testid='disclaimer'] [role='tablist'] [role='tab']")
      tabs.should('have.length.at.least', 4)

      // scrvusd tab should not be open. Find it, click it, and its contents should have a link to the scrvusd docs.
      cy.get('div[role="tabpanel"] a').filter('[href="https://docs.curve.fi/scrvusd/overview/"]').should('not.exist')
      tabs.last().click()
      cy.url().should('include', '?tab=scrvusd')
      cy.get('div[role="tabpanel"] a').filter('[href="https://docs.curve.fi/scrvusd/overview/"]').should('be.visible')
    })
  })
})
