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

  const sliderTestCase = oneOf(
    {
      title: 'liquidity',
      columnId: 'totalSupplied_usdTotal',
      expectedFilterText: 'Min Liquidity: $1,029,000',
      expectedFirstCell: '$2.06M',
    },
    {
      title: 'utilization',
      columnId: 'utilizationPercent',
      expectedFilterText: 'Min Utilization: 50.00%',
      expectedFirstCell: '84.91%',
    },
  )
  it(`should allow filtering by ${sliderTestCase.title}`, () => {
    const { columnId, expectedFilterText, expectedFirstCell } = sliderTestCase
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

  const tokenTestCase = oneOf(
    { title: 'collateral', iconIndex: 0, columnId: 'assets_collateral_symbol' },
    { title: 'debt', iconIndex: 1, columnId: 'assets_borrowed_symbol' },
  )
  const tokenSelector = `[data-testid="data-table-cell-assets"]:first [data-testid^="token-icon-"]`
  it(`should allow filtering by ${tokenTestCase.title} token`, () => {
    const { columnId, iconIndex } = tokenTestCase
    cy.get(`[data-testid="btn-expand-filters"]`).click()
    cy.get(`[data-testid="multi-select-filter-${columnId}"]`).click()
    cy.get(`#menu-${columnId} [data-value="CRV"]`).click()
    cy.get(tokenSelector).eq(iconIndex).should('have.attr', 'data-testid', `token-icon-CRV`)
    cy.get(`#menu-${columnId} [data-value="crvUSD"]`).click()
    cy.get(`[data-testid="token-icon-crvUSD"]`).should('be.visible')
  })

  it('should toggle columns', () => {
    const columnId = oneOf('totalSupplied_usdTotal', 'utilizationPercent', 'rates_borrowApyPcent', 'rates_lendApyPcent')
    const headerSelector = `[data-testid="data-table-header-${columnId}"]`
    cy.get(headerSelector).should('be.visible')
    cy.get(`[data-testid="btn-visibility-settings"]`).click()
    cy.get(`[data-testid="visibility-toggle-${columnId}"]`).click()
    cy.get(headerSelector).should('not.exist')
  })

  it('should toggle the collateral token', () => {
    cy.get(tokenSelector).should('have.length', 2)
    cy.get(`[data-testid="btn-visibility-settings"]`).click()
    cy.get(`[data-testid="visibility-toggle-assets_collateral_symbol"]`).click()
    cy.get(tokenSelector).should('have.length', 1)
  })
})
