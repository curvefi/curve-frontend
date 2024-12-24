import { isInViewport, oneViewport } from '@/support/ui'

describe('LlamaLend Markets', () => {
  beforeEach(() => {
    cy.intercept('https://prices.curve.fi/v1/lending/chains', { body: { data: ['ethereum', 'fraxtal', 'arbitrum'] } })
    cy.intercept('https://api.curve.fi/v1/getLendingVaults/all', { fixture: 'llamalend-markets.json' })
    cy.intercept('https://prices.curve.fi/v1/lending/markets/*/*/snapshots?agg=none', {
      fixture: 'lending-snapshots.json',
    }).as('snapshots')
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
    cy.get('[data-testid="data-table-cell-utilizationPercent"]').first().contains('0.00%')
  })

  it('should show graphs', () => {
    const [green, red] = ['rgb(39, 184, 108)', 'rgb(237, 36, 47)']
    cy.get('[data-testid="line-graph-cell-lend"] path').first().should('have.css', 'stroke', green)
    cy.get('[data-testid="line-graph-cell-borrow"] path').first().should('have.css', 'stroke', red)

    // check that scrolling loads more snapshots:
    cy.get(`@snapshots.all`).then((calls1) => {
      cy.get('[data-testid^="data-table-row"]').last().scrollIntoView()
      cy.wait('@snapshots')
      cy.get('[data-testid^="data-table-row"]').last().should('contain.html', 'path') // wait for the graph to render
      cy.get(`@snapshots.all`).then((calls2) => {
        expect(calls2.length).to.be.greaterThan(calls1.length)
      })
    })
  })
})
