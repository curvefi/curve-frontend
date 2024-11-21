import { oneDesktopViewport, oneMobileOrTabletViewport } from '@/support/ui'

const { expectedMainNavHeight, expectedSubNavHeight, expectedMobileNavHeight, expectedConnectHeight } = {
  expectedMainNavHeight: 56,
  expectedSubNavHeight: 42,
  expectedMobileNavHeight: 40,
  expectedConnectHeight: 40,
}

describe('Header', () => {
  describe('Desktop', () => {
    let isDarkMode: boolean  // when running locally, the dark mode might be the default

    beforeEach(() => {
      cy.viewport(...oneDesktopViewport())
      cy.visit('/', {
        onBeforeLoad: (win) => {
          isDarkMode = win.matchMedia('(prefers-color-scheme: dark)').matches
        }
      })
      cy.get(`[data-testid='btn-connect-prompt']`).should('be.visible') // wait for loading
    })

    it('should have the right size', () => {
      cy.get("[data-testid='main-nav']").invoke('outerHeight').should('equal', expectedMainNavHeight)
      cy.get("[data-testid='subnav']").invoke('outerHeight').should('equal', expectedSubNavHeight)
      cy.get(`header`).invoke('outerHeight').should('equal', expectedSubNavHeight + expectedMainNavHeight)
      cy.get("[data-testid='navigation-connect-wallet']").invoke('outerHeight').should('equal', expectedConnectHeight)
    })

    it('should switch themes', () => {
      cy.get(`[data-testid='navigation-connect-wallet']`).then(($nav) => {
        const font1 = $nav.css('font-family')
        if (!isDarkMode) {
          cy.get(`[data-testid='theme-switcher-light']`).click() // switch to dark mode
        }
        cy.get(`[data-testid='theme-switcher-dark']`).click()
        cy.get(`[data-testid='theme-switcher-chad']`).should('be.visible')

        // check font change
        cy.get(`[data-testid='navigation-connect-wallet']`).then(
          ($el) => {
            const font2 = $el.css('font-family')
            expect(font1).not.to.equal(font2)

            // reset theme
            cy.get(`[data-testid='theme-switcher-chad']`).click()
            cy.get(`[data-testid='theme-switcher-light']`).should('be.visible')
          }
        )
      })
    })
  })

  describe('mobile or tablet', () => {
    beforeEach(() => {
      cy.viewport(...oneMobileOrTabletViewport())
      cy.visit('/')
      cy.get(`[data-testid='btn-connect-prompt']`).should('be.visible') // wait for loading
    })

    it('should open the menu and navigate', () => {
      cy.get(`header`).invoke('outerHeight').should('equal', expectedMobileNavHeight)
      cy.get(`[data-testid='mobile-drawer']`).should('not.exist')
      cy.get(`[data-testid='menu-toggle']`).click()
      cy.get(`[data-testid='mobile-drawer']`).should('be.visible')
      cy.get(`header`).invoke('outerHeight').should('equal', expectedMobileNavHeight)
      cy.get("[data-testid='navigation-connect-wallet']").invoke('outerHeight').should('equal', expectedConnectHeight)

      cy.url().then(url => {
        cy.get('[data-testid^="sidebar-item-"]').eq(2).click()
        cy.get(`[data-testid='mobile-drawer']`).should('not.exist')
        cy.url().should('not.equal', url)
      })
    })

    it('should switch themes', () => {
      cy.get(`[data-testid='menu-toggle']`).click()
      cy.get(`[data-testid='sidebar-settings']`).click()
      cy.get(`[data-testid='sidebar-settings']`).then(($settings) => {
        const font1 = $settings.css('font-family')
        cy.get(`[data-testid='theme-switcher-button-chad']`).click()
        cy.get(`[data-testid='theme-switcher-button-chad']`).should('have.class', 'current')

        // check font change
        cy.get(`[data-testid='sidebar-settings']`).then(
          ($el) => {
            const font2 = $el.css('font-family')
            expect(font1).not.to.equal(font2)
          }
        )
      })
    })
  })
})
