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

describe(`LlamaLend Markets`, () => {
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
    mockLendingSnapshots().as('lend-snapshots')
    mockMintMarkets()
    mockMintSnapshots()

    cy.viewport(width, height)
    cy.visit('/crvusd/ethereum/beta-markets/', {
      onBeforeLoad: (win) => {
        win.localStorage.clear()
        isDarkMode = checkIsDarkMode(win)
      },
      ...LOAD_TIMEOUT,
    })
    cy.get('[data-testid="data-table"]', LOAD_TIMEOUT).should('be.visible')
  })

  const firstRow = () => cy.get(`[data-testid^="data-table-row"]`).first()
  const copyFirstAddress = () => cy.get(`[data-testid^="copy-market-address"]`).first()

  it('should have sticky headers', () => {
    cy.get('[data-testid^="data-table-row"]').last().then(isInViewport).should('be.false')
    cy.get('[data-testid^="data-table-row"]').eq(10).scrollIntoView()
    cy.get('[data-testid="data-table-head"] th').eq(1).then(isInViewport).should('be.true')
    cy.get(`[data-testid^="pool-type-"]`).should('be.visible') // wait for the table to render

    // filter height changes because text wraps depending on the width
    const filterHeight = { mobile: [234, 226, 196, 156], tablet: [188, 176, 120], desktop: [128] }[breakpoint]
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
    cy.get(`[data-testid="chip-lend"]`).click()
    cy.get(`[data-testid="pool-type-mint"]`).should('not.exist')

    const [green, red] = [isDarkMode ? '#32ce79' : '#167d4a', '#ed242f']
    cy.get('[data-testid="line-graph-lend"] path').first().should('have.attr', 'stroke', green)
    cy.get('[data-testid="line-graph-borrow"] path').first().should('have.attr', 'stroke', red)

    // check that scrolling loads more snapshots:
    cy.get(`@lend-snapshots.all`, LOAD_TIMEOUT).then((calls1) => {
      cy.get('[data-testid^="data-table-row"]')
        .last()
        .scrollIntoView({ offset: { top: -100, left: 0 } }) // scroll to the last row, make sure it's still visible
      cy.wait('@lend-snapshots')
      cy.get('[data-testid^="data-table-row"]').last().should('contain.html', 'path') // wait for the graph to render
      cy.wait(range(calls1.length).map(() => '@lend-snapshots'))
      cy.get(`@lend-snapshots.all`, LOAD_TIMEOUT).then((calls2) =>
        expect(calls2.length).to.be.greaterThan(calls1.length),
      )
    })
  })

  it('should find markets by text', () => {
    cy.get("[data-testid='table-text-search']").type('wstETH crvUSD')
    cy.scrollTo(0, 0)
    // sfrxETH market is filtered out
    cy.get(`[data-testid='market-link-0x136e783846ef68C8Bd00a3369F787dF8d683a696']`).should('not.exist')
    // wstETH market is shown
    cy.get(`[data-testid="market-link-0x37417B2238AA52D0DD2D6252d989E728e8f706e4"]`).should('exist')
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

  // todo: this test fails sometimes in ci because the click doesn't work
  it(`should hover and copy the market address`, RETRY_IN_CI, () => {
    const hoverBackground = isDarkMode ? 'rgb(254, 250, 239)' : 'rgb(37, 36, 32)'
    cy.get(`[data-testid^="copy-market-address"]`).should('have.css', 'opacity', breakpoint === 'desktop' ? '0' : '1')
    cy.wait(500) // necessary in chrome for the hover to work properly :(
    firstRow().should('not.have.css', 'background-color', hoverBackground)
    cy.scrollTo(0, 0)
    firstRow().trigger('mouseenter', { waitForAnimations: true, force: true })
    firstRow().should('have.css', 'background-color', hoverBackground)
    copyFirstAddress().should('have.css', 'opacity', '1')
    copyFirstAddress().click()
    copyFirstAddress().click() // click again, in chrome in CI the first click doesn't work (because of tooltip?)
    cy.get(`[data-testid="copy-confirmation"]`).should('be.visible')
  })

  it(`should navigate to market details`, () => {
    const [type, urlRegex] = oneOf(
      ['mint', /\/crvusd\/\w+\/markets\/.+\/create/],
      ['lend', /\/lend\/\w+\/markets\/.+\/create/],
    )
    cy.get(`[data-testid="chip-${type}"]`).click()
    firstRow().contains(capitalize(type))
    cy.get(`[data-testid^="market-link-"]`).first().click()
    cy.url().should('match', urlRegex, LOAD_TIMEOUT)
  })

  it(`should allow filtering by rewards`, { scrollBehavior: false }, () => {
    cy.get(`[data-testid^="data-table-row"]`).should('have.length.at.least', 1)
    cy.get(`[data-testid="chip-rewards"]`).click()
    cy.get(`[data-testid^="data-table-row"]`).should('have.length', 1)
    cy.get(`[data-testid="rewards-badge"]`).should('be.visible')
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
