import { isInViewport, oneViewport } from '@/support/ui'

describe('LlamaLend Markets', () => {
  beforeEach(() => {
    cy.intercept('https://api.curve.fi/v1/getLendingVaults/all', { fixture: 'llamalend-markets.json' })
    cy.viewport(...oneViewport())
    cy.visit('localhost:3001/#/ethereum/beta-markets')
    cy.get('[data-testid="data-table"]').should('be.visible')
  })

  it('should have sticky headers', () => {
    cy.get('[data-testid^="data-table-row"]').last().then(isInViewport).should('be.false')
    cy.get('[data-testid^="data-table-row"]').last().scrollIntoView()
    cy.get('[data-testid="data-table-head"]').last().then(isInViewport).should('be.true')
  })

  it('should sort', () => {
    cy.get('[data-testid="data-table-header-utilizationPercent"]').click()
    cy.get('[data-testid="data-table-cell-utilizationPercent"]').first().contains('100.00%')
    cy.get('[data-testid="data-table-header-utilizationPercent"]').click()
    cy.get('[data-testid="data-table-cell-utilizationPercent"]').first().contains('-')
  })
})
