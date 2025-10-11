import {
  API_LOAD_TIMEOUT,
  AppPath,
  checkIsDarkMode,
  LOAD_TIMEOUT,
  oneAppPath,
  oneDesktopViewport,
  oneMobileOrTabletViewport,
  SCROLL_WIDTH,
  TABLET_BREAKPOINT,
} from '@cy/support/ui'

const expectedMainNavHeight = 56
const expectedSubNavHeight = 42 // 40 + 2px border
const expectedMobileNavHeight = 56
const expectedConnectHeight = 40

const expectedFooterXMargin = { mobile: 32, tablet: 48, desktop: 48 }
const expectedFooterMinWidth = 273
const expectedFooterMaxWidth = 1536

const llamalendApps: AppPath[] = ['llamalend', 'lend', 'crvusd']

describe('Header', () => {
  let viewport: readonly [number, number]

  describe('Desktop', () => {
    let isDarkMode: boolean // when running locally, the dark mode might be the default
    let appPath: AppPath

    beforeEach(() => {
      viewport = oneDesktopViewport()
      cy.viewport(...viewport)
      appPath = oneAppPath()
      cy.visit(`/${appPath}`, {
        onBeforeLoad: (win) => {
          win.localStorage.setItem('phishing-warning-dismissed', `"${new Date().toISOString()}"`)
          isDarkMode = checkIsDarkMode(win)
        },
      })
      waitIsLoaded(appPath)
    })

    it('should have the right size', () => {
      cy.get("[data-testid='main-nav']").invoke('outerHeight').should('equal', expectedMainNavHeight)
      cy.get("[data-testid='subnav']").invoke('outerHeight').should('equal', expectedSubNavHeight)
      cy.get(`header`)
        .invoke('outerHeight')
        .should('equal', expectedSubNavHeight + expectedMainNavHeight)
      cy.get(`header`)
        .invoke('outerWidth')
        .should('equal', viewport[0] - SCROLL_WIDTH)
      cy.get("[data-testid='navigation-connect-wallet']").invoke('outerHeight').should('equal', expectedConnectHeight)

      const expectedFooterWidth = Math.min(
        expectedFooterMaxWidth,
        viewport[0] - expectedFooterXMargin.desktop - SCROLL_WIDTH,
      )
      cy.get("[data-testid='footer-content']").invoke('outerWidth').should('equal', expectedFooterWidth)
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

    it('should change chains', () => {
      if (['dao'].includes(appPath)) {
        // only ethereum supported
        cy.get(`[data-testid='btn-change-chain']`).click()
        cy.get(`[data-testid='alert-eth-only']`).should('be.visible')
        cy.get("[data-testid='app-link-dex']").invoke('attr', 'href').should('include', `/dex/ethereum`)
        return
      }
      switchEthToArbitrum()
      cy.get("[data-testid='app-link-dex']").invoke('attr', 'href').should('include', `/dex/arbitrum`)
    })
  })

  describe('mobile or tablet', () => {
    let appPath: AppPath

    beforeEach(() => {
      viewport = oneMobileOrTabletViewport()
      cy.viewport(...viewport)
      appPath = oneAppPath()
      cy.visit(`/${appPath}`, {
        onBeforeLoad: (win) => win.localStorage.setItem('phishing-warning-dismissed', `"${new Date().toISOString()}"`),
      })
      waitIsLoaded(appPath)
    })

    it(`should have the right size`, () => {
      const breakpoint = viewport[0] < TABLET_BREAKPOINT ? 'mobile' : 'tablet'
      const expectedFooterWidth = Math.max(
        expectedFooterMinWidth,
        viewport[0] - SCROLL_WIDTH - expectedFooterXMargin[breakpoint],
      )
      cy.get(`header`).invoke('outerHeight').should('equal', expectedMobileNavHeight, 'Header height')
      cy.get(`header`)
        .invoke('outerWidth')
        .should('equal', viewport[0] - SCROLL_WIDTH, 'Header width')
      cy.get("[data-testid='footer-content']").invoke('outerWidth').should('equal', expectedFooterWidth, 'Footer width')
      cy.get(`[data-testid='menu-toggle']`).click()
      cy.get(`header`).invoke('outerHeight').should('equal', expectedMobileNavHeight, 'Header height changed')
      cy.get("[data-testid='navigation-connect-wallet']")
        .invoke('outerHeight')
        .should('equal', expectedConnectHeight, 'Connect height')
    })

    it('should open the menu and navigate', () => {
      cy.get(`[data-testid='mobile-drawer']`).should('not.exist')
      cy.get(`[data-testid='menu-toggle']`).click()
      cy.get(`[data-testid='mobile-drawer']`).should('be.visible')

      cy.url().then((url) => {
        const pathname = new URL(url).pathname
        const index = llamalendApps.includes(appPath) ? 1 : 0 // LlamaLend's first option is the default page
        cy.get('[data-testid^="sidebar-item-"]').eq(index).should('have.attr', 'href').and('not.equal', pathname)
        cy.get('[data-testid^="sidebar-item-"]').eq(index).click()
        cy.url(LOAD_TIMEOUT).should('not.equal', url)
        cy.get(`[data-testid='mobile-drawer']`).should('not.exist')
      })
    })

    it('should switch themes', () => {
      cy.get(`[data-testid='menu-toggle']`).click()
      cy.get(`[data-testid='social-buttons']`).scrollIntoView()
      cy.get(`[data-testid='social-buttons']`).should('be.visible')
      cy.get(`[data-testid='sidebar-settings']`).click()
      cy.get(`[data-testid='sidebar-settings']`).then(($settings) => {
        const font1 = $settings.css('font-family')
        cy.get(`[data-testid='theme-switch-button-chad']`).click()
        cy.get(`[data-testid='theme-switch-button-chad']`).should('have.attr', 'aria-pressed', 'true')

        // check font change
        cy.get(`[data-testid='sidebar-settings']`).then(($el) => {
          const font2 = $el.css('font-family')
          expect(font1).not.to.equal(font2)
        })
      })
    })

    it('should change chains', () => {
      if (['dao'].includes(appPath)) {
        // only ethereum supported
        cy.get(`[data-testid='btn-change-chain']`).click()
        cy.get(`[data-testid='alert-eth-only']`).should('be.visible')
        cy.get(`[data-testid='menu-toggle']`).click()
        cy.get(`[data-testid='sidebar-item-pools']`).invoke('attr', 'href').should('include', `/dex/ethereum/pools`)
        return
      }

      switchEthToArbitrum()
      cy.get(`[data-testid='menu-toggle']`).click()
      cy.get(`[data-testid='sidebar-item-pools']`).invoke('attr', 'href').should('include', `/dex/arbitrum/pools`)
    })
  })

  function waitIsLoaded(appPath: AppPath) {
    const app = appPath || 'dex'
    const llamalend = 'data-table-head'
    const id = { dao: 'proposal-title', crvusd: llamalend, lend: llamalend, llamalend, dex: 'inp-search-pools' }[app]
    cy.get(`[data-testid='${id}']`, API_LOAD_TIMEOUT).should('be.visible')
  }

  function switchEthToArbitrum() {
    cy.get(`[data-testid='chain-icon-ethereum']`, LOAD_TIMEOUT).should('be.visible')
    cy.get(`[data-testid='btn-change-chain']`).click()
    cy.get(`[data-testid='menu-item-chain-arbitrum']`).click()
    cy.get(`[data-testid^='menu-item-chain-']`, API_LOAD_TIMEOUT).should('not.exist')
    cy.get(`[data-testid='chain-icon-arbitrum']`).should('be.visible')
  }
})
