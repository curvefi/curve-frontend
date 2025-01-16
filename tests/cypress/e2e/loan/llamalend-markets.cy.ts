import { checkIsDarkMode, isInViewport, oneOf, oneViewport } from '@/support/ui'

describe('LlamaLend Markets', () => {
  let isDarkMode: boolean

  beforeEach(() => {
    cy.intercept('https://prices.curve.fi/v1/lending/chains', { body: { data: ['ethereum', 'fraxtal', 'arbitrum'] } })
    cy.intercept('https://api.curve.fi/v1/getLendingVaults/all', { fixture: 'llamalend-markets.json' })
    cy.intercept('https://prices.curve.fi/v1/lending/markets/*/*/snapshots?agg=none', {
      fixture: 'lending-snapshots.json',
    }).as('snapshots')
    cy.viewport(...oneViewport())
    cy.visit('localhost:3001/#/ethereum/beta-markets', {
      onBeforeLoad: (win) => {
        win.localStorage.clear()
        isDarkMode = checkIsDarkMode(win)
      },
    })
    cy.get('[data-testid="data-table"]').should('be.visible')
  })

  it('should have sticky headers', () => {
    cy.get('[data-testid^="data-table-row"]').last().then(isInViewport).should('be.false')
    cy.get('[data-testid^="data-table-row"]').last().scrollIntoView()
    cy.get('[data-testid="data-table-head"]').last().then(isInViewport).should('be.true')
    cy.get('[data-testid="table-filters"]').invoke('outerHeight').should('equal', 64)
  })

  it('should sort', () => {
    cy.get('[data-testid="data-table-header-utilizationPercent"]').click()
    cy.get('[data-testid="data-table-cell-utilizationPercent"]').first().contains('100.00%')
    cy.get('[data-testid="data-table-header-utilizationPercent"]').click()
    cy.get('[data-testid="data-table-cell-utilizationPercent"]').first().contains('0.00%')
  })

  it('should show graphs', () => {
    const [green, red] = [isDarkMode ? 'rgb(39, 184, 108)' : 'rgb(31, 162, 94)', 'rgb(237, 36, 47)']
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

  it(`should allow filtering by using a slider`, () => {
    const { columnId, expectedFilterText, expectedFirstCell } = oneOf(
      {
        columnId: 'totalSupplied_usdTotal',
        expectedFilterText: 'Min Liquidity: $1,029,000',
        expectedFirstCell: '$2.06M',
      },
      {
        columnId: 'utilizationPercent',
        expectedFilterText: 'Min Utilization: 50.00%',
        expectedFirstCell: '84.91%',
      },
    )
    cy.viewport(1200, 800) // use fixed viewport to have consistent slider width
    cy.get(`[data-testid="minimum-slider-filter-${columnId}"]`).should('not.exist')
    cy.get(`[data-testid="btn-expand-filters"]`).click()
    cy.get(`[data-testid="slider-${columnId}"]`).should('not.exist')
    cy.get(`[data-testid="minimum-slider-filter-${columnId}"]`).click(60, 20)
    cy.get(`[data-testid="slider-${columnId}"]`).click()
    cy.get(`[data-testid="slider-${columnId}"]`).should('not.be.visible')
    cy.get(`[data-testid="minimum-slider-filter-${columnId}"]`).contains(expectedFilterText)
    cy.get(`[data-testid="data-table-cell-${columnId}"]`).first().should('contain', expectedFirstCell)
  })

  it('should allow filtering by chain', () => {
    const chains = ['Ethereum', 'Fraxtal'] // only these chains are in the fixture
    const chain = oneOf(...chains)
    cy.get(`[data-testid="btn-expand-filters"]`).click()
    cy.get('[data-testid="multi-select-filter-blockchainId"]').click()
    cy.get(`#menu-blockchainId [data-value="${chain.toLowerCase()}"]`).click()
    cy.get(`[data-testid="data-table-cell-assets"]:first [data-testid="chain-icon-${chain.toLowerCase()}"]`).should(
      'be.visible',
    )

    const otherChain = oneOf(...chains.filter((c) => c !== chain))
    cy.get(`#menu-blockchainId [data-value="${otherChain.toLowerCase()}"]`).click()
    ;[chain, otherChain].forEach((c) => cy.get(`[data-testid="chain-icon-${c.toLowerCase()}"]`).should('be.visible'))
  })

  it(`should allow filtering by token`, () => {
    const { columnId, iconIndex } = oneOf(
      { iconIndex: 0, columnId: 'assets_collateral_symbol' },
      { iconIndex: 1, columnId: 'assets_borrowed_symbol' },
    )
    cy.get(`[data-testid="btn-expand-filters"]`).click()
    cy.get(`[data-testid="multi-select-filter-${columnId}"]`).click()
    cy.get(`#menu-${columnId} [data-value="CRV"]`).click()
    cy.get(`[data-testid="data-table-cell-assets"]:first [data-testid^="token-icon-"]`)
      .eq(iconIndex)
      .should('have.attr', 'data-testid', `token-icon-CRV`)
    cy.get(`#menu-${columnId} [data-value="crvUSD"]`).click()
    cy.get(`[data-testid="token-icon-crvUSD"]`).should('be.visible')
  })

  it('should toggle columns', () => {
    const { toggle, element } = oneOf(
      // hide the whole column:
      { toggle: 'totalSupplied_usdTotal', element: 'data-table-header-totalSupplied_usdTotal' },
      { toggle: 'utilizationPercent', element: 'data-table-header-utilizationPercent' },
      // hide the graph inside the cell:
      { toggle: 'borrowChart', element: 'line-graph-borrow' },
      { toggle: 'lendChart', element: 'line-graph-lend' },
    )
    cy.get(`[data-testid="${element}"]`).scrollIntoView()
    cy.get(`[data-testid="${element}"]`).should('be.visible')
    cy.get(`[data-testid="btn-visibility-settings"]`).click()
    cy.get(`[data-testid="visibility-toggle-${toggle}"]`).click()
    cy.get(`[data-testid="${element}"]`).should('not.exist')
  })
})
