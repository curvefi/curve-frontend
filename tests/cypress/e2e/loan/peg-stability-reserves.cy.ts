import { PEG_KEEPERS } from '@/loan/components/PagePegKeepers/constants'
import { LOAD_TIMEOUT, oneViewport } from '@cy/support/ui'

/**
 * Gets pegkeeper cards by test ID suffix.
 * The complete test ID format is: pegkeeper-card-{contractAddress}-{suffix}
 * where contractAddress makes each pegkeeper's test IDs unique.
 */
const getPegkeeperCards = (suffix: string) => cy.get(`[data-testid^="pegkeeper-card"][data-testid$="-${suffix}"]`)

describe(`Peg Stability Reserves`, () => {
  let width: number, height: number

  beforeEach(() => {
    ;[width, height] = oneViewport()

    cy.viewport(width, height)
    cy.visit('/crvusd/ethereum/psr/', {
      onBeforeLoad: window => window.localStorage.clear(),
      ...LOAD_TIMEOUT,
    })
    cy.get('[data-testid="pegkeepers"]', LOAD_TIMEOUT).should('be.visible')
  })

  it('should render all pegkeepers', () => {
    getPegkeeperCards('root').as('cards').should('have.length', PEG_KEEPERS.length)
    cy.get('@cards').each($el => {
      cy.wrap($el).should('be.visible')
    })
  })

  it('should render statistics card with metrics', () => {
    cy.get('[data-testid="pegkeeper-stats-reserve"]').should('be.visible')
    cy.get('[data-testid="pegkeeper-stats-total-ceiling"]').should('be.visible')
  })
})
