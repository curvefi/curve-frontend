import { LOAD_TIMEOUT, oneViewport } from '@/support/ui'

describe(`Peg Stability Reserves`, () => {
  let width: number, height: number

  beforeEach(() => {
    ;[width, height] = oneViewport()

    cy.viewport(width, height)
    cy.setCookie('cypress', 'true') // disable server data fetching to speed testing up, it's not needed anyway
    cy.visit('/crvusd/ethereum/psr/', {
      onBeforeLoad: (window) => window.localStorage.clear(),
      ...LOAD_TIMEOUT,
    })
    cy.get('[data-testid="pegkeepers"]', LOAD_TIMEOUT).should('be.visible')
  })

  // Ideally I would match it with the number of entries from PEG_KEEPERS, but that import from @/loan isn't available in tests
  it('should render all pegkeepers', () => {
    cy.get('[data-testid^="pegkeeper-"]').should('have.length.greaterThan', 0)
    cy.get('[data-testid^="pegkeeper-"]').each(($el) => {
      cy.wrap($el).should('be.visible')
    })
  })

  it('should render statistics card with metrics', () => {
    cy.get('[data-testid="pegkeeper-stats-reserve"]').should('be.visible')
    cy.get('[data-testid="pegkeeper-stats-reserve-share"]').should('be.visible')
  })

  it('should render advanced details with pool links', () => {
    cy.get('[data-testid="pegkeeper-action-info-pool"]').should('have.length.greaterThan', 0)
    cy.get('[data-testid="pegkeeper-action-info-pool"] a').each(($el) => {
      cy.wrap($el)
        .should('have.attr', 'href')
        .and('match', /\/dex\/ethereum\/pools\/.*\//)
    })
  })

  it('should render advanced details with contract links', () => {
    cy.get('[data-testid="pegkeeper-action-info-contract"]').should('have.length.greaterThan', 0)
    cy.get('[data-testid="pegkeeper-action-info-contract"] a').each(($el) => {
      cy.wrap($el)
        .should('have.attr', 'href')
        .and('match', /https:\/\/etherscan\.io\/address\/.*/)
    })
  })
})
