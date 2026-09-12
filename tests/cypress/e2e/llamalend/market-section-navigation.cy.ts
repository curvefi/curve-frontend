import { getMarketSections, type MarketSectionId } from '@/llamalend/widgets/market-section-nav'
import { oneOf } from '@cy/support/generators'
import { mockLendingSnapshots, mockMerklCampaigns } from '@cy/support/helpers/lending-mocks'
import { mockLlamalendChartApis } from '@cy/support/helpers/llamalend/mocks/llamalend-chart.mocks'
import type { AppRoute } from '@cy/support/routes'
import { LOAD_TIMEOUT } from '@cy/support/ui'
import { MarketRateType } from '@evm-ui/types/market'

const NAV_ID = 'detail-page-section-nav'
const NAV = `[data-testid="${NAV_ID}"]`
const HEADERS = '[data-testid="desktop-main-nav"], [data-testid="mobile-main-bar"]'
const LEND_PATH = 'lend/ethereum/markets/0x23F5a668A9590130940eF55964ead9787976f2CC' as const
const pages = [
  { label: 'Mint', path: 'crvusd/ethereum/markets/WBTC', rateType: MarketRateType.Borrow },
  { label: 'Lending borrow', path: LEND_PATH, rateType: MarketRateType.Borrow },
  { label: 'Supply', path: `${LEND_PATH}/vault`, rateType: MarketRateType.Supply },
] satisfies { label: string; path: AppRoute; rateType: MarketRateType }[]
const viewports = [
  { label: 'desktop', width: 1440, height: 900 },
  { label: 'mobile', width: 390, height: 844 },
] as const

const headerBottom = (document: Document) =>
  Math.max(0, ...Array.from(document.querySelectorAll(HEADERS), el => el.getBoundingClientRect().bottom))

/** Check that the section's beginning is visible below the navigation, even at the document's scroll limit. */
const assertSectionReached = (section: MarketSectionId) =>
  cy.get(`#${section}`, LOAD_TIMEOUT).should($section => {
    const element = $section[0]
    const document = element.ownerDocument
    const win = document.defaultView!
    const rect = element.getBoundingClientRect()
    const nav = document.querySelector(NAV)!
    const isSticky = win.getComputedStyle(nav.parentElement!).position === 'sticky'
    const obstruction = Math.max(headerBottom(document), isSticky ? nav.getBoundingClientRect().bottom : 0)

    expect(win.scrollY, `${section}: page scrolled`).to.be.greaterThan(0)
    expect(rect.top, `${section}: below navigation`).to.be.at.least(obstruction - 2)
    expect(rect.top, `${section}: inside viewport`).to.be.lessThan(win.innerHeight)
  })

/** Bring the navigation back on screen on mobile, then click the real tab or its overflow link. */
const clickSection = (section: MarketSectionId) => {
  cy.get(NAV).then($nav => {
    const element = $nav[0]
    const win = element.ownerDocument.defaultView!
    cy.scrollTo(0, Math.max(0, element.getBoundingClientRect().top + win.scrollY - headerBottom(win.document)))
  })
  cy.get(`${NAV} [data-testid="${NAV_ID}-${section}"]`).then($tab => {
    if ($tab.is(':visible') && $tab.css('pointer-events') !== 'none') {
      cy.wrap($tab).click({ scrollBehavior: 'center' })
    } else {
      cy.get(`[data-testid="${NAV_ID}-kebab-button"]`).click({ scrollBehavior: 'center' })
      cy.get(`[data-testid="${NAV_ID}-kebab-menu"]`).find(`a[href$="#${section}"]`).click()
    }
  })
}

pages.forEach(({ label, path, rateType }) => {
  viewports.forEach(({ label: viewport, width, height }) => {
    describe(`${label} section navigation (${viewport})`, () => {
      const sections = getMarketSections({ rateType }).map(({ value }) => value)
      // Select once so retries exercise the same case and report it in the test title.
      const candidates = sections.slice(1)
      expect(candidates.length, `${label}: noninitial sections`).to.be.greaterThan(0)
      const linkedSection = oneOf(...candidates)
      const scrolledSection = oneOf(...candidates)

      const visit = (hash = '') => {
        cy.visitWithoutTestConnector(`${path}${hash}`)
        cy.get(NAV, LOAD_TIMEOUT).should('be.visible')
        sections.forEach(section => {
          cy.get(`#${section}`, LOAD_TIMEOUT).should('exist')
        })
        cy.get('[data-testid="no-position-disconnected"]', LOAD_TIMEOUT).should('exist')
        // Loading tables can change section positions when their rows arrive.
        cy.get('[data-testid^="data-table-loading-"]', LOAD_TIMEOUT).should('not.exist')
      }

      beforeEach(() => {
        mockLendingSnapshots('ethereum')
        mockMerklCampaigns()
        mockLlamalendChartApis()
        cy.viewport(width, height)
      })

      it('each button scrolls to its section', () => {
        visit()
        // Visit the initial section last so its click also exercises a transition.
        ;[...sections.slice(1), sections[0]].forEach(section => {
          cy.log(`Navigate to ${section}`)
          clickSection(section)
          cy.location('hash', LOAD_TIMEOUT).should('equal', `#${section}`)
          assertSectionReached(section)
        })
      })

      it(`initial URL scrolls to ${linkedSection}`, () => {
        visit(`#${linkedSection}`)
        assertSectionReached(linkedSection)
        cy.location('hash').should('equal', `#${linkedSection}`)
      })

      it(`scrolling updates the URL to ${scrolledSection}`, () => {
        visit()
        cy.location('hash').should('not.equal', `#${scrolledSection}`)
        cy.get(`#${scrolledSection}`).then($section => {
          const element = $section[0]
          const document = element.ownerDocument
          const win = document.defaultView!
          const navHeight = viewport === 'mobile' ? 0 : document.querySelector(NAV)!.getBoundingClientRect().height
          cy.scrollTo(0, element.getBoundingClientRect().top + win.scrollY - headerBottom(document) - navHeight)
        })
        cy.location('hash', LOAD_TIMEOUT).should('equal', `#${scrolledSection}`)
      })
    })
  })
})
