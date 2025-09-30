import { oneOf } from '@cy/support/generators'
import {
  API_LOAD_TIMEOUT,
  LOAD_TIMEOUT,
  oneAppPath,
  oneDesktopViewport,
  oneTabletViewport,
  oneViewport,
} from '@cy/support/ui'

describe('Disclaimers', () => {
  describe('Footer link', () => {
    const viewport = oneOf(oneDesktopViewport, oneTabletViewport)()
    it(`should contain footer disclaimer links for ${viewport.join('x')}`, () => {
      cy.viewport(...viewport)
      cy.visit(`/${oneAppPath() || 'dex'}/`, {
        onBeforeLoad: (win) => win.sessionStorage.setItem('phishing-warning-dismissed', 'true'),
      })

      // Navigate to risk disclaimer from footer.
      cy.get(`[data-testid='footer']`, LOAD_TIMEOUT).should('be.visible')
      cy.get(`[data-testid='footer'] a`).contains('disclaimer', { matchCase: false }).click()
      cy.url(API_LOAD_TIMEOUT).should('match', /\/disclaimer\/?(\?tab=(lend|crvusd))?$/)
      cy.get(`[data-testid='disclaimer']`, LOAD_TIMEOUT).should('be.visible')
    })
  })

  describe('Navigation', () => {
    const [width, height] = oneViewport()

    it(`should contain multiple tabs for ${width}x${height}`, () => {
      cy.viewport(width, height)
      cy.visit(`/${oneAppPath() || 'dex'}/ethereum/disclaimer`, {
        onBeforeLoad: (win) => win.sessionStorage.setItem('phishing-warning-dismissed', 'true'),
      })

      // Make sure there's tabs available and click one.
      cy.get(`[data-testid='disclaimer']`, LOAD_TIMEOUT).should('be.visible')

      const tabSelector = "[data-testid='disclaimer'] [role='tablist'] [role='tab']"
      cy.get(tabSelector).should('have.length', 4)

      // scrvusd tab should not be open. Find it, click it, and its contents should have a link to the scrvusd docs.
      cy.get('div[role="tabpanel"] a')
        .filter('[href="https://docs.curve.finance/scrvusd/overview/"]')
        .should('not.exist')
      cy.get(tabSelector).last().click()
      cy.url(LOAD_TIMEOUT).should('include', '?tab=scrvusd')
      cy.get('div[role="tabpanel"] a')
        .filter('[href="https://docs.curve.finance/scrvusd/overview/"]')
        .should('be.visible')
    })
  })
})
