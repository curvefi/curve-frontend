import { mockMerklCampaigns } from '@cy/support/helpers/lending-mocks'
import { AppRoute, CRVUSD_PAGE_MARKETS_ROUTE, getRouteTestId, oneAppRoute } from '@cy/support/routes'
import { TIMEOUTS } from '@cy/support/timeout-categories'
import {
  oneDesktopViewport,
  oneMobileOrTabletViewport,
  oneMobileViewport,
  oneViewport,
  SCROLL_WIDTH,
  TABLET_BREAKPOINT,
} from '@cy/support/ui'
import { TIME_FRAMES } from '@ui/lib/time'

const BORDER = 1
const EXPECTED_MAIN_NAV_HEIGHT = 40
const EXPECTED_SUB_NAV_HEIGHT = EXPECTED_MAIN_NAV_HEIGHT
const EXPECTED_MOBILE_NAV_HEIGHT = 56 + BORDER
const EXPECTED_CONNECT_HEIGHT = 40

const expectedFooterXMargin = { mobile: 32, tablet: 48, desktop: 48 }
const EXPECTED_FOOTER_MIN_WIDTH = 273
const EXPECTED_FOOTER_MAX_WIDTH = 1536

describe('Header', () => {
  let width: number, height: number

  beforeEach(() => mockMerklCampaigns())

  describe('Desktop', () => {
    let route: AppRoute

    beforeEach(() => {
      ;[width, height] = oneDesktopViewport()
      cy.viewport(width, height)
      route = oneAppRoute()
      cy.visitWithoutTestConnector(route, { onBeforeLoad: dismissHeaderBanners })
      waitIsLoaded(route)
    })

    it('should have the right size', () => {
      const isCrvusdMarketRoute = route.startsWith(CRVUSD_PAGE_MARKETS_ROUTE)

      const expectedHeaderHeight =
        // crvusd market page route has no subnav
        (isCrvusdMarketRoute ? EXPECTED_MAIN_NAV_HEIGHT : EXPECTED_SUB_NAV_HEIGHT + EXPECTED_MAIN_NAV_HEIGHT) + BORDER

      cy.get("[data-testid='main-nav']").invoke('outerHeight').should('equal', EXPECTED_MAIN_NAV_HEIGHT)

      if (isCrvusdMarketRoute) {
        cy.get("[data-testid='subnav']").should('not.exist')
      } else {
        cy.get("[data-testid='subnav']").invoke('outerHeight').should('equal', EXPECTED_SUB_NAV_HEIGHT)
      }

      cy.get(`header`).invoke('outerHeight').should('equal', expectedHeaderHeight)
      cy.get("[data-testid='navigation-connect-wallet']").invoke('outerHeight').should('equal', EXPECTED_CONNECT_HEIGHT)

      cy.window().then(win => {
        // get scroll width dynamically, crvusd page with small header doesn't render a scrollbar
        const scrollWidth = win.innerWidth - win.document.documentElement.clientWidth
        const expectedFooterWidth = Math.min(
          EXPECTED_FOOTER_MAX_WIDTH,
          width - expectedFooterXMargin.desktop - scrollWidth,
        )

        cy.get(`header`)
          .invoke('outerWidth')
          .should('equal', width - scrollWidth)
        cy.get("[data-testid='footer-content']").invoke('outerWidth').should('equal', expectedFooterWidth)
      })
    })

    it('should switch themes', () => {
      cy.get(`[data-testid='navigation-connect-wallet']`).then($nav => {
        const font1 = $nav.css('font-family')
        cy.get(`[data-testid='user-profile-button']`).click()
        cy.get(`[data-testid='theme-switch-button-chad']`).click()

        // check font change
        cy.get(`[data-testid='navigation-connect-wallet']`).then($el => {
          const font2 = $el.css('font-family')
          expect(font1).not.to.equal(font2)
          cy.get(`[data-testid='theme-switch-button-dark']`).click()
          cy.get(`[data-testid='theme-switch-button-dark']`).should('have.class', 'Mui-selected')
          cy.document().its('body').should('have.class', 'theme-dark')
        })
      })
    })
  })

  describe('mobile or tablet', () => {
    let route: AppRoute

    beforeEach(() => {
      ;[width, height] = oneMobileOrTabletViewport()
      cy.viewport(width, height)
      route = oneAppRoute()
      cy.visitWithoutTestConnector(route, { onBeforeLoad: dismissHeaderBanners })
      waitIsLoaded(route)
    })

    it(`should have the right size`, () => {
      const breakpoint = width < TABLET_BREAKPOINT ? 'mobile' : 'tablet'
      const expectedHeaderHeight =
        EXPECTED_MOBILE_NAV_HEIGHT + (isLendMarketDetailRoute(route) ? EXPECTED_SUB_NAV_HEIGHT : 0)
      const expectedFooterWidth = Math.max(
        EXPECTED_FOOTER_MIN_WIDTH,
        width - SCROLL_WIDTH - expectedFooterXMargin[breakpoint],
      )
      cy.get(`header`).invoke('outerHeight').should('equal', expectedHeaderHeight, 'Header height')
      cy.get(`header`)
        .invoke('outerWidth')
        .should('equal', width - SCROLL_WIDTH, 'Header width')
      cy.get("[data-testid='footer-content']").invoke('outerWidth').should('equal', expectedFooterWidth, 'Footer width')
      cy.get(`[data-testid='menu-toggle']`).click()
      cy.get(`header`).invoke('outerHeight').should('equal', expectedHeaderHeight, 'Header height changed')
      cy.get("[data-testid='navigation-connect-wallet']")
        .invoke('outerHeight')
        .should('equal', EXPECTED_CONNECT_HEIGHT, 'Connect height')
    })

    it('should show lend subnav only on lend market pages', () => {
      if (isLendMarketDetailRoute(route)) {
        cy.get("[data-testid='lend-market-subnav']").should('be.visible')
      } else {
        cy.get("[data-testid='lend-market-subnav']").should('not.exist')
      }
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
        cy.url(TIMEOUTS['ui.navigation']).should('not.equal', href)
        cy.get(`[data-testid='mobile-drawer']`).should('not.exist')
      })
    })

    it('should switch themes', () => {
      cy.get(`[data-testid='menu-toggle']`).click()
      cy.get(`[data-testid='social-buttons']`).scrollIntoView()
      cy.get(`[data-testid='social-buttons']`).should('be.visible')
      cy.get(`[data-testid='sidebar-settings']`).click()
      cy.get(`[data-testid='sidebar-settings']`).then($settings => {
        const font1 = $settings.css('font-family')
        cy.get(`[data-testid='theme-switch-button-chad']`).click()
        cy.get(`[data-testid='theme-switch-button-chad']`).should('have.attr', 'aria-pressed', 'true')

        // check font change
        cy.get(`[data-testid='sidebar-settings']`).then($el => {
          const font2 = $el.css('font-family')
          expect(font1).not.to.equal(font2)
        })
      })
    })
  })

  describe('Phishing Warning Banner', () => {
    function visitWithDismissedBanner(dismissedDate?: number) {
      ;[width, height] = oneViewport()
      cy.viewport(width, height)
      const route = oneAppRoute()
      cy.visitWithoutTestConnector(route, {
        onBeforeLoad: win => {
          if (dismissedDate) {
            win.localStorage.setItem('phishing-warning-dismissed', JSON.stringify(dismissedDate))
          }
        },
      })
      waitIsLoaded(route)
    }

    it('should display the banner and allow dismissal', () => {
      visitWithDismissedBanner()
      cy.get("[data-testid='phishing-warning-banner']", TIMEOUTS['ui.render']).should('be.visible')
      // Click the banner to dismiss it
      cy.get("[data-testid='phishing-warning-banner']").find('button').first().click()
      cy.get("[data-testid='phishing-warning-banner']").should('not.exist')
    })

    it('should reappear after one month', () => {
      // Set dismissal date to 31 days ago (more than one month)
      const oneMonthAgo = Date.now() - 31 * TIME_FRAMES.DAY_MS
      visitWithDismissedBanner(oneMonthAgo)
      cy.get("[data-testid='phishing-warning-banner']", TIMEOUTS['ui.render']).should('be.visible')
    })

    it('should remain hidden within one month', () => {
      // Set dismissal date to 15 days ago (less than one month)
      const fifteenDaysAgo = Date.now() - 15 * TIME_FRAMES.DAY_MS
      visitWithDismissedBanner(fifteenDaysAgo)
      cy.get("[data-testid='phishing-warning-banner']", TIMEOUTS['ui.render']).should('not.exist')
    })
  })

  ;([oneDesktopViewport(), oneMobileViewport()] as const).forEach(([viewportWidth, viewportHeight, viewport]) => {
    it(`updates the ${viewport} header links after switching networks`, () => {
      cy.viewport(viewportWidth, viewportHeight)
      cy.visitWithoutTestConnector('/dex/ethereum/pools', { onBeforeLoad: dismissHeaderBanners })
      switchEthToArbitrum()
      cy.location('pathname').should('match', /^\/dex\/arbitrum\/pools\/?$/)

      if (viewport === 'desktop') {
        cy.get('[data-testid="app-link-dex"]')
          .invoke('attr', 'href')
          .should('match', /^\/dex\/arbitrum\/?$/)
      } else {
        cy.get('[data-testid="menu-toggle"]').click()
        cy.get('[data-testid="sidebar-item-pools"]').should('have.attr', 'href', '/dex/arbitrum/pools')
      }
    })
  })

  it('shows the market network without offering to switch a vault to another chain', () => {
    ;[width, height] = oneDesktopViewport()
    cy.viewport(width, height)
    const path = '/lend/ethereum/markets/0xcaD85b7fe52B1939DCEebEe9bCf0b2a5Aa0cE617/vault'
    cy.visitWithoutTestConnector(path, { onBeforeLoad: dismissHeaderBanners })
    cy.get('[data-testid="form-market-page"]', TIMEOUTS['ui.render']).should('be.visible')
    cy.get('header [data-testid="chain-icon-ethereum"]').should('be.visible')
    cy.get('header [data-testid="network-lock"]').should('be.visible')
    cy.get('header [data-testid="btn-change-chain"]').click()
    cy.get('[data-testid="alert-eth-only"]').should('contain.text', 'This market is only available on Ethereum')
    cy.get('[role="dialog"]').should('not.exist')
    cy.location('pathname').should('match', new RegExp(`^${path}/?$`))
  })

  it('explains the Ethereum-only savings network without opening a selector', () => {
    ;[width, height] = oneDesktopViewport()
    cy.viewport(width, height)
    cy.visitWithoutTestConnector('/crvusd/ethereum/scrvUSD', { onBeforeLoad: dismissHeaderBanners })
    cy.get('header [data-testid="btn-change-chain"]', TIMEOUTS['ui.render']).click()
    cy.get('[data-testid="alert-eth-only"]').should('be.visible')
    cy.get('[data-testid^="menu-item-chain-"]').should('not.exist')
    cy.location('pathname').should('match', /^\/crvusd\/ethereum\/scrvUSD\/?$/)
  })

  const dismissHeaderBanners = (win: Cypress.AUTWindow) => {
    // Keep navigation size assertions independent of temporary header announcements.
    const dismissedAt = JSON.stringify(Date.now())
    win.localStorage.setItem('phishing-warning-dismissed', dismissedAt)
    win.localStorage.setItem('dex-dashboard-retirement-dismissed', dismissedAt)
  }

  const waitIsLoaded = (route: AppRoute) =>
    cy.get(`[data-testid='${getRouteTestId(route)}']`, TIMEOUTS['ui.render']).should('be.visible')

  function switchEthToArbitrum() {
    cy.get(`[data-testid='chain-icon-ethereum']`, TIMEOUTS['ui.render']).should('be.visible')
    cy.get(`[data-testid='btn-change-chain']`).click()
    cy.get(`[data-testid='missing-chain-config']`).should('not.exist')
    cy.get(`[data-testid='menu-item-chain-arbitrum']`).click()
    cy.get(`[data-testid^='menu-item-chain-']`, TIMEOUTS['ui.render']).should('not.exist')
    cy.get(`[data-testid='chain-icon-arbitrum']`).should('be.visible')
  }

  function isLendMarketDetailRoute(route: AppRoute) {
    const [app, , page, marketId] = route.split('/')
    return app === 'lend' && page === 'markets' && !!marketId
  }
})
