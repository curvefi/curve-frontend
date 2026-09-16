import { getMarketSections, type MarketSectionId } from '@/llamalend/widgets/market-section-nav'
import { oneOf } from '@cy/support/generators'
import { mockLendingSnapshots, mockMerklCampaigns } from '@cy/support/helpers/lending-mocks'
import { LOAN_TEST_MARKETS } from '@cy/support/helpers/llamalend/create-loan.helpers'
import { mockLlamalendChartApis } from '@cy/support/helpers/llamalend/mocks/llamalend-chart.mocks'
import { clickTab } from '@cy/support/helpers/tabs'
import type { AppRoute } from '@cy/support/routes'
import { API_LOAD_TIMEOUT, LOAD_TIMEOUT, oneViewport } from '@cy/support/ui'
import { MarketRateType, MarketType } from '@evm-ui/types/market'

const NAV_ID = 'detail-page-section-nav'
const NAV = `[data-testid="${NAV_ID}"]`
const LEND_PATH = LOAN_TEST_MARKETS[MarketType.Lend][0].path
const [WIDTH, HEIGHT, BREAKPOINT] = oneViewport()
const PAGE = oneOf(
  ...([
    { label: 'Mint', path: LOAN_TEST_MARKETS[MarketType.Mint][1].path, rateType: MarketRateType.Borrow },
    { label: 'Lending borrow', path: LEND_PATH, rateType: MarketRateType.Borrow },
    { label: 'Supply', path: `${LEND_PATH}/vault`, rateType: MarketRateType.Supply },
  ] satisfies { label: string; path: `/${AppRoute}`; rateType: MarketRateType }[]),
)

const headerBottom = (document: Document) =>
  document.querySelector('[data-testid="desktop-main-nav"], [data-testid="mobile-main-bar"]')!.getBoundingClientRect()
    .bottom

/** Check that the section's beginning is visible below the navigation, even at the document's scroll limit. */
const assertSectionReached = (section: MarketSectionId) =>
  cy.window().then(win =>
    cy
      .get(`#${section}`, LOAD_TIMEOUT)
      .its(0)
      .invoke(LOAD_TIMEOUT, 'getBoundingClientRect')
      .should(({ top }) => {
        const obstruction = Math.max(
          headerBottom(win.document),
          BREAKPOINT === 'mobile' ? 0 : win.document.querySelector(NAV)!.getBoundingClientRect().bottom,
        )

        expect(win.scrollY, `${section}: page scrolled`).to.be.greaterThan(0)
        expect(top, `${section}: below navigation`).to.be.at.least(obstruction)
        expect(top, `${section}: inside viewport`).to.be.lessThan(win.innerHeight)
      }),
  )

describe(`${PAGE.label} section navigation (${BREAKPOINT}, ${WIDTH}x${HEIGHT})`, () => {
  const sections = getMarketSections({ rateType: PAGE.rateType }).map(({ value }) => value)
  const selectedSection = oneOf(...sections)

  const visit = (hash = '') => {
    cy.visitWithoutTestConnector(`${PAGE.path.slice(1)}${hash}` as AppRoute)
    cy.get(NAV, LOAD_TIMEOUT).should('be.visible')
    sections.forEach(section => {
      cy.get(`#${section}`, LOAD_TIMEOUT).should('exist')
    })
    cy.get('[data-testid="no-position-disconnected"]', LOAD_TIMEOUT).should('exist')
    // Loading tables can change section positions when their rows arrive.
    cy.get('[data-testid^="data-table-loading-"]', API_LOAD_TIMEOUT).should('not.exist')
  }

  beforeEach(() => {
    mockLendingSnapshots('ethereum')
    mockMerklCampaigns()
    mockLlamalendChartApis()
    cy.viewport(WIDTH, HEIGHT)
  })

  it('each button scrolls to its section', () => {
    visit()
    // Reverse the order so the initial section is clicked last, after navigating away from it.
    const orderedSections = sections.toReversed()
    orderedSections.forEach(section => {
      cy.log(`Navigate to ${section}`)
      // Mobile navigation scrolls off-screen; sticky desktop/tablet tabs need no automatic scrolling.
      clickTab(NAV_ID, section, LOAD_TIMEOUT, { scrollBehavior: BREAKPOINT === 'mobile' ? 'center' : false })
      cy.location('hash', LOAD_TIMEOUT).should('equal', `#${section}`)
      assertSectionReached(section)
    })
  })

  it(`initial URL scrolls to ${selectedSection}`, () => {
    visit(`#${selectedSection}`)
    assertSectionReached(selectedSection)
    cy.location('hash').should('equal', `#${selectedSection}`)
  })

  it(`scrolling updates the URL to ${selectedSection}`, () => {
    visit()
    cy.location('hash').should('not.equal', `#${selectedSection}`)
    cy.get(`#${selectedSection}`).its(0).invoke('scrollIntoView')
    cy.location('hash', LOAD_TIMEOUT).should('equal', `#${selectedSection}`)
  })
})
