import { capitalize } from 'lodash'
import { oneOf, oneTokenType, range, shuffle, type TokenType } from '@/support/generators'
import {
  createLendingVaultResponses,
  type LendingVaultResponses,
  mockLendingChains,
  mockLendingSnapshots,
  mockLendingVaults,
} from '@/support/helpers/lending-mocks'
import { mockChains, mockMintMarkets, mockMintSnapshots } from '@/support/helpers/minting-mocks'
import { mockTokenPrices } from '@/support/helpers/tokens'
import { type Breakpoint, checkIsDarkMode, isInViewport, LOAD_TIMEOUT, oneViewport, RETRY_IN_CI } from '@/support/ui'

describe('LlamaLend Markets', () => {
  let isDarkMode: boolean
  let breakpoint: Breakpoint
  let vaultData: LendingVaultResponses

  beforeEach(() => {
    const [width, height, screen] = oneViewport()
    vaultData = createLendingVaultResponses()
    breakpoint = screen
    mockChains()
    mockLendingChains()
    mockTokenPrices()
    mockLendingVaults(vaultData)
    mockLendingSnapshots().as('snapshots')
    mockMintMarkets()
    mockMintSnapshots()

    cy.viewport(width, height)
    cy.visit('/crvusd/ethereum/beta-markets/', {
      onBeforeLoad: (win) => {
        win.localStorage.clear()
        isDarkMode = checkIsDarkMode(win)
      },
    })
    cy.get('[data-testid="data-table"]', LOAD_TIMEOUT).should('be.visible')
  })

  it('should have sticky headers', () => {
    if (breakpoint === 'mobile') {
      cy.viewport(400, 400) // fixed mobile viewport, filters wrap depending on the width
    }

    cy.get('[data-testid^="data-table-row"]').last().then(isInViewport).should('be.false')
    cy.get('[data-testid^="data-table-row"]').eq(10).scrollIntoView()
    cy.get('[data-testid="data-table-head"] th').eq(1).then(isInViewport).should('be.true')
    cy.get(`[data-testid^="pool-type-"]`).should('be.visible') // wait for the table to render

    // filter height changes because text wraps depending on the width
    const filterHeight = { mobile: [202], tablet: [112, 144, 200], desktop: [120] }[breakpoint]
    cy.get('[data-testid="table-filters"]').invoke('outerHeight').should('be.oneOf', filterHeight)

    const rowHeight = { mobile: 77, tablet: 88, desktop: 88 }[breakpoint]
    cy.get('[data-testid^="data-table-row"]').eq(10).invoke('outerHeight').should('equal', rowHeight)
  })

  // todo: contains(%) seems to be too early still, sometimes the handler doesn't react to the click
  it('should sort', RETRY_IN_CI, () => {
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
    cy.get(`@snapshots.all`, LOAD_TIMEOUT).then((calls1) => {
      cy.get('[data-testid^="data-table-row"]').last().scrollIntoView()
      cy.wait('@snapshots')
      cy.get('[data-testid^="data-table-row"]').last().should('contain.html', 'path') // wait for the graph to render
      cy.wait(range(calls1.length).map(() => '@snapshots'))
      cy.get(`@snapshots.all`, LOAD_TIMEOUT).then((calls2) => {
        expect(calls2.length).to.be.greaterThan(calls1.length)
      })
    })
  })

  it(`should allow filtering by using a slider`, () => {
    const [columnId, initialFilterText] = oneOf(
      ['liquidityUsd', 'Liquidity: $0 -'],
      ['utilizationPercent', 'Utilization: 0.00% -'],
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
    const chains = Object.keys(vaultData)
    const chain = oneOf(...chains)
    cy.get('[data-testid="multi-select-filter-chain"]').should('not.exist')
    cy.get(`[data-testid="btn-expand-filters"]`).click()

    selectChain(chain)
    cy.get(`[data-testid="data-table-cell-assets"]:first [data-testid="chain-icon-${chain}"]`).should('be.visible')

    const otherChain = oneOf(...chains.filter((c) => c !== chain))
    selectChain(otherChain)
    ;[chain, otherChain].forEach((c) => cy.get(`[data-testid="chain-icon-${c}"]`).should('be.visible'))
  })

  it(`should allow filtering by token`, () => {
    const type = oneTokenType()
    cy.get(`[data-testid="btn-expand-filters"]`).click()
    const coins = vaultData.ethereum.data.map((d) => d[(type + '_token') as `${typeof type}_token`].symbol)
    const coin1 = oneOf(...coins)
    const coin2 = oneOf(...coins.filter((c) => c !== coin1))
    selectCoin(coin1, type)
    selectCoin(coin2, type)
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
      cy.get(`[data-testid^="pool-type-"]`).each(($el) => expect($el.attr('data-testid')).equals(`pool-type-${type}`))
      cy.get(`[data-testid^="data-table-row"]`).should('have.length.below', length)
      cy.get(`[data-testid="chip-${otherType}"]`).click()
      cy.get(`[data-testid^="data-table-row"]`).should('have.length', length)
    })
  })

  it(`should hover and copy the market address`, () => {
    const hoverBackground = isDarkMode ? 'rgb(254, 250, 239)' : 'rgb(37, 36, 32)'
    cy.get(`[data-testid^="copy-market-address"]`).should('have.css', 'opacity', breakpoint === 'desktop' ? '0' : '1')
    cy.get(`[data-testid^="data-table-row"]`).first().should('not.have.css', 'background-color', hoverBackground)
    cy.get(`[data-testid^="data-table-row"]`).first().trigger('mouseenter')
    cy.get(`[data-testid^="data-table-row"]`).first().should('have.css', 'background-color', hoverBackground)
    cy.get(`[data-testid^="copy-market-address"]`).should('have.css', 'opacity', '1')
    cy.get(`[data-testid^="copy-market-address"]`).first().click()
    cy.get(`[data-testid="copy-confirmation"]`).should('be.visible')
  })

  it(`should navigate to market details`, () => {
    const [type, expectedUrl] = oneOf(['mint', '/crvusd/ethereum/markets/'], ['lend', '/lend/ethereum/markets/'])
    cy.get(`[data-testid="chip-${type}"]`).click()
    cy.get(`[data-testid^="data-table-row"]`).first().contains(capitalize(type))
    cy.get(`[data-testid^="market-link-"]`).first().click()
    cy.url().should('include', expectedUrl, LOAD_TIMEOUT)
  })

  it(`should allow filtering by rewards`, () => {
    cy.get(`[data-testid^="data-table-row"]`).should('have.length.at.least', 1)
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

function selectChain(chain: string) {
  cy.get('[data-testid="multi-select-filter-chain"]').click()
  cy.get(`[data-testid="menu-chain"] [value="${chain}"]`).click()
  cy.get(`body`).click(0, 0) // close popover
}

const selectCoin = (symbol: string, type: TokenType) => {
  const columnId = `assets_${type}_symbol`
  cy.get(`[data-testid="multi-select-filter-${columnId}"]`).click()

  // deselect previously selected tokens
  cy.forEach(`[data-testid="${columnId}"] [aria-selected="true"]`, (el) => el.click())

  cy.get(`[data-testid="menu-${columnId}"] [value="${symbol}"]`).click()
  cy.get('body').click(0, 0) // close popover
  cy.get(`[data-testid="data-table-cell-assets"] [data-testid^="token-icon-${symbol}"]`).should('be.visible')
}
