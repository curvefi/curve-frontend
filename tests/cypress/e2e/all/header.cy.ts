import { oneDesktopViewport, oneMobileOrTabletViewport, oneViewport } from '@/support/ui'

const { expectedMainNavHeight, expectedSubNavHeight, expectedMobileNavHeight, expectedConnectHeight } = {
  expectedMainNavHeight: 56,
  expectedSubNavHeight: 42, // 40 + 2px border
  expectedMobileNavHeight: 56,
  expectedConnectHeight: 40,
}

describe('Header', () => {
  describe('Desktop', () => {
    let isDarkMode: boolean // when running locally, the dark mode might be the default

    beforeEach(() => {
      cy.viewport(...oneDesktopViewport())
      cy.visit('/', {
        onBeforeLoad: (win) => (isDarkMode = win.matchMedia('(prefers-color-scheme: dark)').matches),
      })
      waitIsLoaded()
    })

    it('should have the right size', () => {
      cy.get("[data-testid='main-nav']").invoke('outerHeight').should('equal', expectedMainNavHeight)
      cy.get("[data-testid='subnav']").invoke('outerHeight').should('equal', expectedSubNavHeight)
      cy.get(`header`)
        .invoke('outerHeight')
        .should('equal', expectedSubNavHeight + expectedMainNavHeight)
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
        cy.get(`[data-testid='navigation-connect-wallet']`).then(($el) => {
          const font2 = $el.css('font-family')
          expect(font1).not.to.equal(font2)

          // reset theme
          cy.get(`[data-testid='theme-switcher-chad']`).click()
          cy.get(`[data-testid='theme-switcher-light']`).should('be.visible')
        })
      })
    })
  })

  describe('mobile or tablet', () => {
    beforeEach(() => {
      cy.viewport(...oneMobileOrTabletViewport())
      cy.visit('/')
      waitIsLoaded()
    })

    it('should open the menu and navigate', () => {
      cy.get(`header`).invoke('outerHeight').should('equal', expectedMobileNavHeight)
      cy.get(`[data-testid='mobile-drawer']`).should('not.exist')
      cy.get(`[data-testid='menu-toggle']`).click()
      cy.get(`[data-testid='mobile-drawer']`).should('be.visible')
      cy.get(`header`).invoke('outerHeight').should('equal', expectedMobileNavHeight)
      cy.get("[data-testid='navigation-connect-wallet']").invoke('outerHeight').should('equal', expectedConnectHeight)

      cy.url().then((url) => {
        const clickIndex = Cypress.env('APP') == 'dao' ? 0 : 1
        cy.get('[data-testid^="sidebar-item-"]').eq(clickIndex).click()
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
        cy.get(`[data-testid='sidebar-settings']`).then(($el) => {
          const font2 = $el.css('font-family')
          expect(font1).not.to.equal(font2)
        })
      })
    })
  })

  it('should change chains', () => {
    cy.viewport(...oneViewport())
    cy.visit('/')
    if (['loan', 'dao'].includes(Cypress.env('APP'))) {
      expect(cy.get(`[data-testid='btn-change-chain']`).should('not.exist'))
      return
    }

    const [eth, arbitrum] = [1, 42161]
    cy.get(`[data-testid='chain-icon-${eth}']`).should('be.visible')
    cy.get(`[data-testid='btn-change-chain']`).click()
    cy.get(`[data-testid='menu-item-chain-${arbitrum}']`).click()
    cy.get(`[data-testid^='menu-item-chain-']`).should('not.exist')
    cy.get(`[data-testid='chain-icon-${arbitrum}']`).should('be.visible')
  })

  function waitIsLoaded() {
    const testId = Cypress.env('APP') == 'dao' ? 'proposal-title' : 'btn-connect-prompt'
    cy.get(`[data-testid='${testId}']`).should('be.visible') // wait for loading
  }
})
