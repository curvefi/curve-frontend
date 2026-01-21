import { oneOf } from '@cy/support/generators'
import { oneDisclaimersSubTabs, oneLegalPageTab } from '@cy/support/helpers/tabs'
import { clickTab } from '@cy/support/helpers/tabs'
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
      cy.visit(`/${oneAppPath() || 'dex'}/`)

      //Navigate to legal route from footer link
      cy.get(`[data-testid='footer']`, LOAD_TIMEOUT).should('be.visible')
      cy.get(`[data-testid='footer'] a`).contains('legal', { matchCase: false }).click()
      cy.url(API_LOAD_TIMEOUT).should('match', /\/legal\/?$/)
      cy.get(`[data-testid='legal-page']`, LOAD_TIMEOUT).should('be.visible')
    })
  })

  describe('Navigation', () => {
    const [width, height] = oneViewport()
    it(`should contain and have clickable tabs for ${width}x${height}`, () => {
      cy.viewport(width, height)
      cy.visit(`/${oneAppPath() || 'dex'}/ethereum/legal`)

      // click one Legal page tab.
      clickTab('legal-tab', oneLegalPageTab())

      // Navigate to the Disclaimer tab and check if the subtabs load. Then click one of them
      const selectedTab = 'disclaimers'
      clickTab('legal-tab', selectedTab)
      cy.url(LOAD_TIMEOUT).should('include', `?tab=${selectedTab}`)
      const subtab = oneDisclaimersSubTabs()
      clickTab('legal-disclaimer-tab', subtab)
      cy.url(LOAD_TIMEOUT).should('include', `?tab=${selectedTab}&subtab=${subtab}`)
      // Check that content loaded in the tabpanel
      cy.get('div[role="tabpanel"]', LOAD_TIMEOUT).should('be.visible').and('not.be.empty')
    })

    it('should use the first tab as default when the wrong tab is provided', () => {
      cy.visit('/lend/#/ethereum/legal?tab=dontexist')
      // Verify the first tab (Terms & Conditions) is selected
      cy.get('[data-testid="legal-tab-terms"]', LOAD_TIMEOUT)
        .should('have.attr', 'aria-selected', 'true')
        .and('have.class', 'Mui-selected')
    })

    it('should use the current page subtab as default when the wrong subtab is provided', () => {
      cy.visit('/lend/#/ethereum/legal?tab=disclaimers&subtab=dontexist')

      // Verify the Disclaimers tab is selected and the lend subtab is selected
      cy.get('[data-testid="legal-disclaimer-tab-lend"]', LOAD_TIMEOUT)
        .should('have.attr', 'aria-selected', 'true')
        .and('have.class', 'Mui-selected')
    })
  })
})
