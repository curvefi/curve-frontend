import { mockMerklCampaigns } from '@cy/support/helpers/lending-mocks'
import { LOAD_TIMEOUT } from '@cy/support/ui'
import { ReleaseChannel } from '@ui-kit/utils'

const LEND_MARKET = '0x23F5a668A9590130940eF55964ead9787976f2CC'
const MARKET_PATH = `/lend/ethereum/markets/${LEND_MARKET}`
const RELEASE_CHANNEL_KEY = 'release-channel-v1'

const visitMarket = (channel: ReleaseChannel, hash = '') =>
  cy.visit(`${MARKET_PATH}${hash}`, {
    onBeforeLoad: window => window.localStorage.setItem(RELEASE_CHANNEL_KEY, JSON.stringify(channel)),
  })

describe('LlamaLend market section navigation', () => {
  beforeEach(() => mockMerklCampaigns())

  it('loads a section hash directly', () => {
    visitMarket(ReleaseChannel.Beta, '#faqs')

    cy.location('hash', LOAD_TIMEOUT).should('equal', '#faqs')
    cy.get('[data-testid="market-section-faqs"]', LOAD_TIMEOUT).should($section => {
      expect($section[0].getBoundingClientRect().top).to.be.greaterThan(0).and.lessThan(300)
    })
    cy.get('[data-testid="market-section-nav-faqs"]').should('have.class', 'Mui-selected')
    cy.get('[data-testid="llamalend-market-faq"] h2').should('have.text', 'FAQs')
    cy.get('[data-testid="llamalend-market-faq"] h3').should('have.length.greaterThan', 0)
  })

  it('updates the hash and scroll position when a section tab is clicked', () => {
    visitMarket(ReleaseChannel.Beta)

    cy.get('[data-testid="market-section-nav-faqs"]', LOAD_TIMEOUT).click()
    cy.location('hash').should('equal', '#faqs')
    cy.get('[data-testid="market-section-faqs"]').should($section => {
      expect($section[0].getBoundingClientRect().top).to.be.greaterThan(0).and.lessThan(300)
    })
  })

  it('updates the active tab while scrolling', () => {
    visitMarket(ReleaseChannel.Beta)

    cy.get('[data-testid="market-section-market-parameters"]', LOAD_TIMEOUT).scrollIntoView()
    cy.get('[data-testid="market-section-nav-market-parameters"]').should('have.class', 'Mui-selected')
  })

  it('supports keyboard navigation', () => {
    visitMarket(ReleaseChannel.Beta)

    cy.get('[data-testid="market-section-nav-position-details"]', LOAD_TIMEOUT).focus().type('{rightarrow}')
    cy.focused().should('have.attr', 'href', '#market-overview')
  })

  it('keeps all section tabs reachable on mobile', () => {
    cy.viewport(375, 760)
    visitMarket(ReleaseChannel.Beta)

    cy.get('[data-testid="market-section-nav"] .MuiTabs-scroller', LOAD_TIMEOUT).should($scroller => {
      expect($scroller[0].scrollWidth).to.be.greaterThan($scroller[0].clientWidth)
    })
    cy.get('[data-testid="market-section-nav-faqs"]').focus().should('be.visible')
  })

  it('keeps the stable market page on the legacy composition', () => {
    visitMarket(ReleaseChannel.Stable)

    cy.get('[data-testid="market-section-nav"]', LOAD_TIMEOUT).should('not.exist')
    cy.get('[data-testid="market-chart-and-activity"]').should('be.visible')
    cy.get('[data-testid="market-advanced-details"]').should('be.visible')
    cy.get('[data-testid="llamalend-market-faq"] h2').should('have.text', 'Frequently Asked Questions')
    cy.get('[data-testid="llamalend-market-faq"] h3').should('have.length.greaterThan', 0)
  })
})
