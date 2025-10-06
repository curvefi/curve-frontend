import { oneOf } from '@cy/support/generators'
import {
  API_LOAD_TIMEOUT,
  LOAD_TIMEOUT,
  oneAppPath,
  oneDesktopViewport,
  oneTabletViewport,
  oneViewport,
} from '@cy/support/ui'

describe('Legal', () => {
  describe('Footer Link', () => {
    const viewport = oneOf(oneDesktopViewport, oneTabletViewport)()
    it(`it should contain footer legal link for ${viewport.join('x')}`, () => {
      cy.viewport(...viewport)
      cy.visit(`/${oneAppPath() || 'dex'}/`, {
        onBeforeLoad: (win) => win.localStorage.setItem('phishing-warning-dismissed', `"${new Date().toISOString()}"`),
      })

      //Navigate to legal route from footer link
      cy.get(`[data-testid='footer']`, LOAD_TIMEOUT).should('be.visible')
      cy.get(`[data-testid='footer'] a`).contains('legal', { matchCase: false }).click()
      cy.url(API_LOAD_TIMEOUT).should('match', /\/legal\/?$/)
      cy.get(`[data-testid='legal-page']`, LOAD_TIMEOUT).should('be.visible')
    })
  })

  describe('Navigation', () => {
    const [width, height] = oneViewport()
    it(`should contain multiple tabs for ${width}x${height}`, () => {
      cy.viewport(width, height)
      cy.visit(`/${oneAppPath() || 'dex'}/ethereum/legal`, {
        onBeforeLoad: (win) => win.localStorage.setItem('phishing-warning-dismissed', `"${new Date().toISOString()}"`),
      })

      // Make sure there's tabs available and click one.
      cy.get(`[data-testid='legal-page']`, LOAD_TIMEOUT).should('be.visible')
      const tabSelector = "[data-testid='legal-page'] [role='tablist'] [role='tab']"
      cy.get(tabSelector).should('have.length', 3)

      // Navigate to the Disclaimer tab and check if the other tabs load. Then click the scrvusd tab
      cy.get(tabSelector).last().click()
      cy.url(LOAD_TIMEOUT).should('include', '?tab=disclaimers')
      const subTabsSelector = "[data-testid='legal-page'] [role='tablist'] [role='tab']"
      cy.get(subTabsSelector).last().click()
      cy.url(LOAD_TIMEOUT).should('include', '?tab=disclaimers&subtab=scrvusd')
      cy.get('div[role="tabpanel"] a')
        .filter('[href="https://docs.curve.finance/scrvusd/overview/"]')
        .should('be.visible')
    })

    it('should use the first tab as default when the wrong tab is provided', () => {
      cy.visit('/lend/#/ethereum/legal?tab=dontexist')
      // Verify the first tab (Terms & Conditions) is selected
      cy.get("[data-testid='legal-page'] [role='tablist'] [role='tab']")
        .first()
        .should('have.attr', 'aria-selected', 'true')
        .and('have.class', 'Mui-selected')
    })

    it('should use the current page subtab as default when the wrong subtab is provided', () => {
      cy.visit('/lend/#/ethereum/legal?tab=disclaimers&subtab=dontexist')

      // Verify the Disclaimers tab is selected and the lend subtab is selected
      cy.get("[data-testid='legal-page'] [role='tablist']")
        .contains("[role='tab']", 'LlamaLend')
        .should('have.attr', 'aria-selected', 'true')
        .and('have.class', 'Mui-selected')
    })
  })
})
