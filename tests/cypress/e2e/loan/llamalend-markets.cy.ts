import { oneViewport } from '@/support/ui'

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
})

const isInViewport = ($el: JQuery) => {
  const height = Cypress.$(cy.state('window')).height()!
  const width = Cypress.$(cy.state('window')).width()!
  const rect = $el[0].getBoundingClientRect()
  return (
    rect.top + rect.height / 2 > 0 &&
    rect.top + rect.height / 2 < height &&
    rect.left + rect.width / 2 > 0 &&
    rect.left + rect.width / 2 < width
  )
}
