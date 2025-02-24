import { type Breakpoint, checkIsDarkMode, isInViewport, oneViewport } from '@/support/ui'
import { mockLendingChains, mockLendingSnapshots, mockLendingVaults } from '@/support/helpers/lending-mocks'
import { mockChains, mockMintMarkets, mockMintSnapshots } from '@/support/helpers/minting-mocks'
import { oneOf, range, shuffle } from '@/support/generators'
import { mockTokenPrices } from '@/support/helpers/tokens'

describe('LlamaLend Markets', () => {
  let isDarkMode: boolean
  let breakpoint: Breakpoint

  beforeEach(() => {
    const [width, height, screen] = oneViewport()
    breakpoint = screen
    mockChains()
    mockLendingChains()
    mockTokenPrices()
    mockLendingVaults()
    mockLendingSnapshots().as('snapshots')
    mockMintMarkets()
    mockMintSnapshots()

    cy.viewport(width, height)
    cy.visit('/crvusd#/ethereum/beta-markets', {
      onBeforeLoad: (win) => {
        win.localStorage.clear()
        isDarkMode = checkIsDarkMode(win)
      },
    })
    cy.get('[data-testid="data-table"]').should('be.visible')
  })

  it('should have sticky headers', () => {
    if (breakpoint === 'mobile') {
      cy.viewport(400, 400) // fixed mobile viewport, filters wrap depending on the width
    }

    cy.get('[data-testid^="data-table-row"]').last().then(isInViewport).should('be.false')
    cy.get('[data-testid^="data-table-row"]').eq(10).scrollIntoView()
    cy.get('[data-testid="data-table-head"] th').eq(1).then(isInViewport).should('be.true')
    cy.get(`[data-testid^="pool-type-"]`).should('be.visible') // wait for the table to render
    const filterHeight = { mobile: 202, tablet: [112, 144], desktop: 120 }[breakpoint]
    const rowHeight = { mobile: 77, tablet: 88, desktop: 88 }[breakpoint]
    const outerHeight = cy.get('[data-testid="table-filters"]').invoke('outerHeight')
    if (typeof filterHeight === 'number') {
      outerHeight.should('equal', filterHeight)
    } else {
      // the height can be within a range, because the text wraps depending on the width
      outerHeight.should('be.within', ...filterHeight)
    }
    cy.get('[data-testid^="data-table-row"]').eq(10).invoke('outerHeight').should('equal', rowHeight)
  })

  it('should sort', () => {
    cy.get(`[data-testid^="data-table-cell-utilizationPercent"]`).first().contains('%')
    cy.get('[data-testid="data-table-header-utilizationPercent"]').click()
    cy.get('[data-testid="data-table-cell-utilizationPercent"]').first().contains('100.00%')
    cy.get('[data-testid="data-table-header-utilizationPercent"]').click()
    cy.get('[data-testid="data-table-cell-utilizationPercent"]').first().contains('0.00%')
  })

  it('should show graphs', () => {
    const [green, red] = [isDarkMode ? '#32ce79' : '#167d4a', '#ed242f']
    cy.get('[data-testid="line-graph-lend"] path').first().should('have.attr', 'stroke', green)
    cy.get('[data-testid="line-graph-borrow"] path').first().should('have.attr', 'stroke', red)

    // check that scrolling loads more snapshots:
    cy.get(`@snapshots.all`).then((calls1) => {
      cy.get('[data-testid^="data-table-row"]').last().scrollIntoView()
      cy.wait('@snapshots')
      cy.get('[data-testid^="data-table-row"]').last().should('contain.html', 'path') // wait for the graph to render
      cy.wait(range(calls1.length).map(() => '@snapshots'))
      cy.get(`@snapshots.all`).then((calls2) => {
        expect(calls2.length).to.be.greaterThan(calls1.length)
      })
    })
  })

  it(`should allow filtering by using a slider`, () => {
    const [columnId, initialFilterText] = oneOf(
      ['liquidityUsd', 'Min Liquidity: $0'],
      ['utilizationPercent', 'Min Utilization: 0.00%'],
    )
    cy.viewport(1200, 800) // use fixed viewport to have consistent slider width
    cy.get(`[data-testid^="data-table-row"]`).then(({ length }) => {
      cy.get(`[data-testid="minimum-slider-filter-${columnId}"]`).should('not.exist')
      cy.get(`[data-testid="btn-expand-filters"]`).click()
      cy.get(`[data-testid="minimum-slider-filter-${columnId}"]`).should('contain', initialFilterText)
      cy.get(`[data-testid="slider-${columnId}"]`).should('not.exist')
      cy.get(`[data-testid="minimum-slider-filter-${columnId}"]`).click()
      cy.get(`[data-testid="slider-${columnId}"]`).click(60, 20)
      cy.get(`[data-testid="slider-${columnId}"]`).should('not.exist')
      cy.get(`[data-testid="minimum-slider-filter-${columnId}"]`).should('not.contain', initialFilterText)
      cy.get(`[data-testid^="data-table-row"]`).should('have.length.below', length)
    })
  })

  it('should allow filtering by chain', () => {
    const chains = ['Ethereum', 'Fraxtal'] // only these chains are in the fixture
    const chain = oneOf(...chains)
    cy.get('[data-testid="multi-select-filter-chain"]').should('not.exist')
    cy.get(`[data-testid="btn-expand-filters"]`).click()
    cy.get('[data-testid="multi-select-filter-chain"]').click()
    cy.get(`#menu-chain [data-value="${chain.toLowerCase()}"]`).click()
    cy.get(`[data-testid="data-table-cell-assets"]:first [data-testid="chain-icon-${chain.toLowerCase()}"]`).should(
      'be.visible',
    )

    const otherChain = oneOf(...chains.filter((c) => c !== chain))
    cy.get(`#menu-chain [data-value="${otherChain.toLowerCase()}"]`).click()
    ;[chain, otherChain].forEach((c) => cy.get(`[data-testid="chain-icon-${c.toLowerCase()}"]`).should('be.visible'))
  })

  it(`should allow filtering by token`, () => {
    const columnId = oneOf('assets_collateral_symbol', 'assets_borrowed_symbol')
    cy.get(`[data-testid="btn-expand-filters"]`).click()
    const selectCoin = (symbol: string) => {
      cy.get(`[data-testid="multi-select-filter-${columnId}"]`).click()
      cy.get(`#menu-${columnId} [data-value="${symbol}"]`).click()
      cy.get('body').click(0, 0) // close popover
      cy.get(`[data-testid="data-table-cell-assets"] [data-testid^="token-icon-${symbol}"]`).should('be.visible')
    }
    selectCoin('sfrxETH')
    selectCoin('crvUSD')
  })

  it(`should allow filtering favorites`, () => {
    cy.get(`[data-testid="favorite-icon"]`).first().click()
    cy.get(`[data-testid="chip-favorites"]`).click()
    cy.get(`[data-testid^="data-table-row"]`).should('have.length', 1)
    cy.get(`[data-testid="favorite-icon"]`).should('not.exist')
    cy.get(`[data-testid="favorite-icon-filled"]`).click()
    cy.get(`[data-testid="table-empty-row"]`).should('exist')
    cy.get(`[data-testid="reset-filter"]`).click()
    cy.get(`[data-testid^="data-table-row"]`).should('have.length.above', 1)
  })

  it(`should allow filtering by market type`, () => {
    cy.get(`[data-testid^="data-table-row"]`).then(({ length }) => {
      const [type, otherType] = shuffle('mint', 'lend')
      cy.get(`[data-testid="chip-${type}"]`).click()
      cy.get(`[data-testid^="pool-type-"]`).each(($el) =>
        expect($el.attr('data-testid')).equals(`pool-type-${otherType}`),
      )
      cy.get(`[data-testid^="data-table-row"]`).should('have.length.below', length)
      cy.get(`[data-testid="chip-${otherType}"]`).click()
      cy.get(`[data-testid^="data-table-row"]`).should('have.length', length)
    })
  })

  it(`should allow filtering by rewards`, () => {
    cy.get(`[data-testid="chip-rewards"]`).click()
    cy.get(`[data-testid^="data-table-row"]`).should('have.length', 1)
    cy.get(`[data-testid="rewards-lp"]`).should('be.visible')
    cy.get(`[data-testid="chip-rewards"]`).click()
    cy.get(`[data-testid^="data-table-row"]`).should('have.length.above', 1)
  })

  it('should toggle columns', () => {
    const { toggle, element } = oneOf(
      // hide the whole column:
      { toggle: 'liquidityUsd', element: 'data-table-header-liquidityUsd' },
      { toggle: 'utilizationPercent', element: 'data-table-header-utilizationPercent' },
      // hide the graph inside the cell:
      { toggle: 'borrowChart', element: 'line-graph-borrow' },
      { toggle: 'lendChart', element: 'line-graph-lend' },
    )
    cy.get(`[data-testid="${element}"]`).first().scrollIntoView()
    cy.get(`[data-testid="${element}"]`).should('be.visible')
    cy.get(`[data-testid="btn-visibility-settings"]`).click()
    cy.get(`[data-testid="visibility-toggle-${toggle}"]`).click()
    cy.get(`[data-testid="${element}"]`).should('not.exist')
  })
})
