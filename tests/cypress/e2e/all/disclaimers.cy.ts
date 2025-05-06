import { LOAD_TIMEOUT, oneAppPath, oneDesktopViewport, oneTabletViewport, oneViewport } from '@/support/ui'

describe('Disclaimers', () => {
  describe('Footer link', () => {
    ;[oneDesktopViewport(), oneTabletViewport()].forEach((viewport) => {
      it(`should contain footer disclaimer links for ${viewport[0]}x${viewport[1]}`, () => {
        cy.viewport(...viewport)
        cy.visit(`/${oneAppPath() || 'dex'}/`)

        // Navigate to risk disclaimer from footer.
        cy.get(`[data-testid='footer']`, LOAD_TIMEOUT).should('be.visible')
        cy.get(`[data-testid='footer'] a`).contains('disclaimer', { matchCase: false }).click()
        cy.url(LOAD_TIMEOUT).should('match', /\/disclaimer\/?(\?tab=(lend|crvusd))?$/)
        cy.get(`[data-testid='disclaimer']`).should('be.visible')
      })
    })
  })

  describe('Navigation', () => {
    const [width, height] = oneViewport()

    it(`should contain multiple tabs for ${width}x${height}`, () => {
      cy.viewport(width, height)
      cy.visit(`/${oneAppPath() || 'dex'}/ethereum/disclaimer`)

      // Make sure there's tabs available and click one.
      cy.get(`[data-testid='disclaimer']`, LOAD_TIMEOUT).should('be.visible')

      const tabSelector = "[data-testid='disclaimer'] [role='tablist'] [role='tab']"
      cy.get(tabSelector).should('have.length.at.least', 4)

      // scrvusd tab should not be open. Find it, click it, and its contents should have a link to the scrvusd docs.
      cy.get('div[role="tabpanel"] a').filter('[href="https://docs.curve.fi/scrvusd/overview/"]').should('not.exist')
      cy.get(tabSelector).last().click()
      cy.url(LOAD_TIMEOUT).should('include', '?tab=scrvusd')
      cy.get('div[role="tabpanel"] a').filter('[href="https://docs.curve.fi/scrvusd/overview/"]').should('be.visible')
    })
  })
})
