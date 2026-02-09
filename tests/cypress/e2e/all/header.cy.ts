import { AppRoute, DEFAULT_PAGES, getRouteApp, getRouteTestId, oneAppRoute } from '@cy/support/routes'
import {
  API_LOAD_TIMEOUT,
  LOAD_TIMEOUT,
  oneDesktopViewport,
  oneMobileOrTabletViewport,
  oneViewport,
  SCROLL_WIDTH,
  TABLET_BREAKPOINT,
} from '@cy/support/ui'
import { TIME_FRAMES } from '@ui-kit/lib/model/time'

const expectedMainNavHeight = 40
const expectedSubNavHeight = expectedMainNavHeight
const expectedMobileNavHeight = 56
const expectedConnectHeight = 40

const expectedFooterXMargin = { mobile: 32, tablet: 48, desktop: 48 }
const expectedFooterMinWidth = 273
const expectedFooterMaxWidth = 1536

describe('Header', () => {
  let viewport: readonly [number, number]

  describe('Desktop', () => {
    let route: AppRoute

    beforeEach(() => {
      viewport = oneDesktopViewport()
      cy.viewport(...viewport)
      dismissPhishingWarningBanner()
      route = oneAppRoute()
      cy.visitWithoutTestConnector(route)
      waitIsLoaded(route)
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
        cy.get(`[data-testid='user-profile-button']`).click()
        cy.get(`[data-testid='theme-switch-button-chad']`).click()

        // check font change
        cy.get(`[data-testid='navigation-connect-wallet']`).then(($el) => {
          const font2 = $el.css('font-family')
          expect(font1).not.to.equal(font2)
          cy.get(`[data-testid='theme-switch-button-dark']`).click()
          cy.get(`[data-testid='theme-switch-button-dark']`).should('have.class', 'Mui-selected')
          cy.document().its('body').should('have.class', 'theme-dark')
        })
      })
    })

    it('should change chains', () => {
      const routeApp = getRouteApp(route)
      if (['dao', 'crvusd'].includes(routeApp)) {
        // only ethereum supported
        cy.get(`[data-testid='btn-change-chain']`).click()
        cy.get(`[data-testid='alert-eth-only']`).should('be.visible')
        cy.get("[data-testid='app-link-dex']").invoke('attr', 'href').should('include', `/dex/ethereum`)
        return
      }
      switchEthToArbitrum()
      const [app, page] = DEFAULT_PAGES[routeApp]
      cy.url().should('match', new RegExp(`.*/${app}/arbitrum${page}/?$`.replaceAll('/', '\\/')))
      cy.get("[data-testid='app-link-dex']").invoke('attr', 'href').should('include', `/dex/arbitrum`)
    })
  })

  describe('mobile or tablet', () => {
    let route: AppRoute

    beforeEach(() => {
      viewport = oneMobileOrTabletViewport()
      cy.viewport(...viewport)
      dismissPhishingWarningBanner()
      route = oneAppRoute()
      cy.visitWithoutTestConnector(route)
      waitIsLoaded(route)
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

      cy.window().then(({ document, location: { href, pathname } }) => {
        const isFirstPage = document.querySelector('[data-testid^="sidebar-item-"]')?.classList.contains('current')
        const index = isFirstPage ? 1 : 0 // pick 2nd link if first is current
        cy.get('[data-testid^="sidebar-item-"]').eq(index).should('have.attr', 'href').and('not.equal', pathname)
        cy.get('[data-testid^="sidebar-item-"]').eq(index).click()
        cy.url(LOAD_TIMEOUT).should('not.equal', href)
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
      if (['dao', 'crvusd'].includes(getRouteApp(route))) {
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

  describe('Phishing Warning Banner', () => {
    function visitWithDismissedBanner(dismissedDate?: number) {
      const [width, height] = oneViewport()
      viewport = [width, height]
      cy.viewport(...viewport)
      const route = oneAppRoute()
      cy.visitWithoutTestConnector(route, {
        onBeforeLoad: (win) => {
          if (dismissedDate) {
            win.localStorage.setItem('phishing-warning-dismissed', JSON.stringify(dismissedDate))
          }
        },
      })
      waitIsLoaded(route)
    }

    it('should display the banner and allow dismissal', () => {
      visitWithDismissedBanner()
      cy.get("[data-testid='phishing-warning-banner']", LOAD_TIMEOUT).should('be.visible')
      // Click the banner to dismiss it
      cy.get("[data-testid='phishing-warning-banner']").find('button').first().click()
      cy.get("[data-testid='phishing-warning-banner']").should('not.exist')
    })

    it('should reappear after one month', () => {
      // Set dismissal date to 31 days ago (more than one month)
      const oneMonthAgo = Date.now() - 31 * TIME_FRAMES.DAY_MS
      visitWithDismissedBanner(oneMonthAgo)
      cy.get("[data-testid='phishing-warning-banner']", LOAD_TIMEOUT).should('be.visible')
    })

    it('should remain hidden within one month', () => {
      // Set dismissal date to 15 days ago (less than one month)
      const fifteenDaysAgo = Date.now() - 15 * TIME_FRAMES.DAY_MS
      visitWithDismissedBanner(fifteenDaysAgo)
      cy.get("[data-testid='phishing-warning-banner']", LOAD_TIMEOUT).should('not.exist')
    })
  })

  function dismissPhishingWarningBanner(date?: number) {
    cy.window().then((win) => {
      win.localStorage.setItem('phishing-warning-dismissed', JSON.stringify(date ?? Date.now()))
    })
  }

  function waitIsLoaded(route: AppRoute) {
    cy.get(`[data-testid='${getRouteTestId(route)}']`, API_LOAD_TIMEOUT).should('be.visible')
  }

  function switchEthToArbitrum() {
    cy.get(`[data-testid='chain-icon-ethereum']`, LOAD_TIMEOUT).should('be.visible')
    cy.get(`[data-testid='btn-change-chain']`).click()
    cy.get(`[data-testid='menu-item-chain-arbitrum']`).click()
    cy.get(`[data-testid^='menu-item-chain-']`, API_LOAD_TIMEOUT).should('not.exist')
    cy.get(`[data-testid='chain-icon-arbitrum']`).should('be.visible')
  }
})
