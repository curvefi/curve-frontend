/* eslint-disable @typescript-eslint/no-unused-expressions */
import lodash, { max } from 'lodash'
import { LlamaMarketColumnId } from '@/llamalend/features/market-list/columns/columns.enum'
import type { GetMarketsResponse } from '@curvefi/prices-api/llamalend'
import { range, recordValues } from '@curvefi/prices-api/objects.util'
import { oneOf, shuffle, type TokenType } from '@cy/support/generators'
import {
  closeDrawer,
  closeSlider,
  expandFilters,
  expandFirstRowOnMobile,
  firstRow,
  getHiddenCount,
  openDrawer,
  withFilterChips,
} from '@cy/support/helpers/data-table.helpers'
import {
  Chain,
  createLendingVaultChainsResponse,
  HighTVLAddress,
  HighUtilizationAddress,
  mockLendingSnapshots,
  mockLendingVaults,
  mockMerklCampaigns,
} from '@cy/support/helpers/lending-mocks'
import { mockMintMarkets, mockMintSnapshots } from '@cy/support/helpers/minting-mocks'
import { mockTokenPrices } from '@cy/support/helpers/tokens'
import {
  assertInViewport,
  assertNotInViewport,
  type Breakpoint,
  e2eBaseUrl,
  LOAD_TIMEOUT,
  oneDesktopViewport,
  oneViewport,
  RETRY_IN_CI,
} from '@cy/support/ui'
import { SMALL_POOL_TVL } from '@ui-kit/features/user-profile/store'
import { MarketRateType } from '@ui-kit/types/market'

const wstEthMarket = '0x100dAa78fC509Db39Ef7D04DE0c1ABD299f4C6CE' as const
const sfrxEthMarket = '0x8472A9A7632b173c8Cf3a86D3afec50c35548e76' as const

describe(`LlamaLend Markets`, () => {
  let breakpoint: Breakpoint
  let width: number, height: number
  let vaultData: Record<Chain, GetMarketsResponse>

  beforeEach(() => {
    ;[width, height, breakpoint] = oneViewport()
    vaultData = setupMocks()
    visitAndWait([width, height, breakpoint])
  })

  it('should have sticky headers', () => {
    cy.get('[data-testid^="data-table-row"]').last().then(assertNotInViewport)
    cy.get('[data-testid^="data-table-row"]').eq(10).scrollIntoView()
    cy.get('[data-testid="data-table-head"] th').eq(1).then(assertInViewport)
    cy.get(`[data-testid^="pool-type-"]`).should('be.visible') // wait for the table to render

    // filter height changes because text wraps depending on the width
    const filterHeight = {
      // the height of the header changes depending on how often the description text wraps
      mobile: [176, 144, 134],
      // on tablet, we expect 3 rows until 900px, then 2 rows
      tablet: [144, 112, 104],
      // on desktop, we expect 2 rows always
      desktop: [104],
    }[breakpoint]
    cy.get('[data-testid="table-filters"]').invoke('outerHeight').should('be.oneOf', filterHeight)
    cy.get('[data-testid^="data-table-row"]').eq(10).invoke('outerHeight').should('equal', 65)
  })

  it('should sort', () => {
    const utilizationColumnId = LlamaMarketColumnId.UtilizationPercent
    cy.get(`[data-testid^="data-table-row"]`)
      .first()
      .find(`[data-testid="market-link-${HighTVLAddress}"]`)
      .should('exist')
    withFilterChips(breakpoint, () => {
      cy.get(`[data-testid="chip-lend"]`).click()
      return cy.get(`[data-testid="pool-type-mint"]`).should('not.exist')
    })
    if (breakpoint == 'mobile') {
      cy.get(`[data-testid="data-table-cell-tvl"]`).first().contains('$')
      openDrawer(breakpoint, 'sort')
      cy.get('[data-testid="drawer-sort-menu-lamalend-markets"]').contains('Utilization', LOAD_TIMEOUT)
      cy.get(`[data-testid="drawer-sort-menu-lamalend-markets"] li[value="${utilizationColumnId}"]`).click()
      cy.get('[data-testid="drawer-sort-menu-lamalend-markets"]').should('not.be.visible')
      cy.get(`[data-testid^="data-table-row"]`)
        .first()
        .find(`[data-testid="market-link-${HighUtilizationAddress}"]`)
        .should('exist')
      expandFirstRowOnMobile(breakpoint)
      // note: not possible currently to sort ascending
      return cy.get(`[data-testid="metric-${utilizationColumnId}"]`).contains('99%', LOAD_TIMEOUT)
    } else {
      cy.get(`[data-testid="data-table-cell-${LlamaMarketColumnId.BorrowRate}"]`).first().contains('%')
      cy.get(`[data-testid="data-table-header-${utilizationColumnId}"]`).click()
      cy.get(`[data-testid="data-table-cell-${utilizationColumnId}"]`).first().contains('99%', LOAD_TIMEOUT)
      cy.get(`[data-testid="data-table-header-${utilizationColumnId}"]`).click()
      cy.get(`[data-testid="data-table-cell-${utilizationColumnId}"]`).first().contains('0%', LOAD_TIMEOUT)
    }
  })

  // todo: retry cause this fails in large screens with small data set (laziness not triggered, everything is shown)
  it('should show charts', RETRY_IN_CI, () => {
    withFilterChips(breakpoint, () => {
      cy.get(`[data-testid="chip-lend"]`).click()
      return cy.get(`[data-testid="pool-type-mint"]`).should('not.exist')
    })
    expandFirstRowOnMobile(breakpoint)
    if (breakpoint != 'mobile') {
      enableGraphColumn()
    }
    checkLineGraphColor(MarketRateType.Borrow, '#ed242f')

    // check that scrolling loads more snapshots:
    cy.get(`@lend-snapshots.all`, LOAD_TIMEOUT).then((calls1) => {
      cy.get('[data-testid^="data-table-row"]')
        .last()
        .scrollIntoView({ offset: { top: -height / 2, left: 0 } }) // scroll to the last row, make sure it's still visible
      if (breakpoint == 'mobile') {
        cy.get(`[data-testid="expand-icon"]`).last().scrollIntoView()
        cy.get(`[data-testid="expand-icon"]`).last().click()
      }
      cy.wait('@lend-snapshots')
      cy.get('[data-testid^="data-table-row"]').last().should('contain.html', 'path') // wait for the graph to render
      cy.wait(range(calls1.length).map(() => '@lend-snapshots'))
      cy.get(`@lend-snapshots.all`, LOAD_TIMEOUT).then((calls2) =>
        expect(calls2.length).to.be.greaterThan(calls1.length),
      )
    })
  })

  it('should find markets by text', () => {
    cy.get('[data-testid="btn-expand-search-Llamalend Markets"]').click({ waitForAnimations: true })
    cy.get("[data-testid^='table-text-search-'] input").should('be.focused') // element is focused when animation completes
    cy.get("[data-testid='table-text-search-Llamalend Markets'] input").type('wstETH crvUSD')
    cy.url().should('include', 'assets=wstETH+crvUSD') // todo: this should be called `search`!
    cy.scrollTo(0, 0)
    cy.get(`[data-testid='market-link-${sfrxEthMarket}']`).should('not.exist')
    cy.get(`[data-testid="market-link-${wstEthMarket}"]`).should('exist')
  })

  it('persists search filter across reload', () => {
    cy.viewport(width, height)
    cy.visit(`/llamalend/ethereum/markets/?assets=wstETH+crvUSD`)
    cy.get('[data-testid="data-table"]', LOAD_TIMEOUT).should('be.visible')
    cy.get("[data-testid='table-text-search-Llamalend Markets'] input").should('have.value', 'wstETH crvUSD')
    cy.get(`[data-testid="market-link-${wstEthMarket}"]`).should('exist')
    cy.get('[data-testid="data-table-cell-assets"]').first().contains('wstETH')
  })

  it('should allow filtering by using a slider', () => {
    const [columnId, initialFilterText] = oneOf(
      [LlamaMarketColumnId.LiquidityUsd, '$0 -'],
      [LlamaMarketColumnId.Tvl, '$10k -'],
      [LlamaMarketColumnId.UtilizationPercent, '0% -'],
    )
    // Keep the viewport stable for slider width.
    cy.viewport(...((breakpoint === 'mobile' ? [500, 800] : [1200, 800]) as [number, number]))
    cy.get(`[data-testid^="data-table-row"]`).then(({ length }) => {
      cy.get(`[data-testid="minimum-slider-filter-${columnId}"]`).should('not.be.visible')
      expandFilters(breakpoint)
      cy.get(`[data-testid="minimum-slider-filter-${columnId}"]`).should('contain', initialFilterText)
      cy.get(`[data-testid="slider-${columnId}"]`).should('not.exist')

      cy.get(`[data-testid="minimum-slider-filter-${columnId}"]`).click({ waitForAnimations: true })
      cy.get(`[data-testid="slider-${columnId}"]`).as('slider').should('be.visible')
      cy.get(`@slider`)
        .then(($el) =>
          // With log slider a click from the left is not enough to filter
          // Click 20px from the right edge and vertically centered
          [($el.width() ?? 80) - 20, ($el.height() ?? 24) / 2],
        )
        .then(([x, y]) => cy.get(`@slider`).click(x, y, { waitForAnimations: true }))
      closeSlider(breakpoint)
      cy.get(`[data-testid^="data-table-row"]`, LOAD_TIMEOUT).should('have.length.below', length)
    })
  })

  it(`should allow filtering by using a slider input`, () => {
    const [columnId, getFilterValue] = oneOf(
      ['liquidityUsd', () => getMaxLiquidity(vaultData) / 10],
      ['tvl', () => getMaxTvl(vaultData) / 10],
      ['utilizationPercent', () => 90],
    )

    cy.get(`[data-testid^="data-table-row"]`).then(({ length }) => {
      cy.get(`[data-testid="minimum-slider-filter-${columnId}"]`).should('not.be.visible')
      expandFilters(breakpoint)

      //  open the chosen filter
      cy.get(`[data-testid="minimum-slider-filter-${columnId}"]`).click({ waitForAnimations: true })
      cy.get(`[data-testid="slider-${columnId}"]`).as('slider').should('be.visible')

      // Always type into the right input when the slider has a range.
      cy.get(`@slider`).closest('[role="presentation"]').find('input[type="text"]').last().as('inputs')

      cy.get('@inputs').click()
      cy.get('@inputs').type('{selectAll}')
      cy.get('@inputs').type(`${getFilterValue()}`)
      cy.get('@inputs').blur()

      closeSlider(breakpoint)
      cy.get(`[data-testid^="data-table-row"]`).should('have.length.below', length)
      cy.url().should('include', `${columnId}=`)
    })
  })

  it('should let the TVL filter override the default small pools cutoff', () => {
    getHiddenCount(breakpoint).then((hiddenBefore) => {
      expect(!!hiddenBefore, `Cannot parse hidden count ${hiddenBefore}`).to.be.true
      expandFilters(breakpoint)
      cy.get(`[data-testid="minimum-slider-filter-tvl"]`).click({ waitForAnimations: true })
      cy.get(`[data-testid="slider-tvl"]`).as('slider').should('be.visible')
      cy.get(`[data-testid="slider-input-tvl-min"]`).clear()
      cy.get(`[data-testid="slider-input-tvl-min"]`).type('0')
      closeSlider(breakpoint)
      cy.url().should('equal', `${e2eBaseUrl()}/llamalend/ethereum/markets/?${new URLSearchParams('tvl=0~')}`)
      getHiddenCount(breakpoint).then((hiddenAfter) => {
        expect(+hiddenAfter).to.be.lessThan(+hiddenBefore)
      })
    })
  })

  it('should allow filtering by chain', () => {
    const chains = Object.keys(vaultData)
    const chain = oneOf(...chains)
    cy.get(`[data-testid="chip-chain-${chain}"]`).click()
    cy.url().should('include', `chain=${chain}`)

    cy.get(`[data-testid="data-table-cell-assets"]:first [data-testid="chain-icon-${chain}"]`).should('be.visible')

    const otherChain = oneOf(...chains.filter((c) => c !== chain))
    cy.get(`[data-testid="chip-chain-${otherChain}"]`).click()
    ;[chain, otherChain].forEach((c) => cy.get(`[data-testid="chain-icon-${c}"]`).should('be.visible'))
    cy.url().should('include', chain)
    cy.url().should('include', otherChain)
  })

  it(`should allow filtering by token`, () => {
    if (breakpoint == 'mobile') {
      openDrawer(breakpoint, 'filter')
    } else {
      cy.get(`[data-testid="btn-expand-filters"]`).click()
    }
    checkCoinSelection('collateral')
    checkCoinSelection('borrowed')
  })

  it('should allow filtering favorites', { scrollBehavior: false }, () => {
    openDrawer(breakpoint, 'filter')
    // on desktop, the favorite icon is not visible until hovered - but cypress doesn't support that so use force
    cy.get(`[data-testid="favorite-icon"]`).first().click({ force: true })

    closeDrawer(breakpoint)
    withFilterChips(breakpoint, () => cy.get(`[data-testid="chip-favorites"]`).click())
    cy.url().should('include', 'isFavorite=yes')
    cy.get(`[data-testid^="data-table-row"]`).should('have.length', 1)
    cy.get(`[data-testid="favorite-icon"]:visible`).should('not.exist')
    cy.get(`[data-testid="favorite-icon-filled"]:visible`).click()
    cy.get(`[data-testid="table-empty-row"]`).should('exist')
    withFilterChips(breakpoint, () => cy.get(`[data-testid="reset-filter"]`).click())
    cy.url().should('not.include', 'isFavorite=')
    cy.get(`[data-testid^="data-table-row"]`).should('have.length.above', 1)
  })

  it(`should allow filtering by market type`, () =>
    withFilterChips(breakpoint, () =>
      cy.get(`[data-testid^="data-table-row"]`).then(({ length }) => {
        const [type, otherType] = shuffle('Mint', 'Lend')
        cy.get(`[data-testid="chip-${type.toLowerCase()}"]`).click()
        cy.url().should('include', `type=${type}`)
        cy.get(`[data-testid^="pool-type-"]`).each(($el) =>
          expect($el.attr('data-testid')).equals(`pool-type-${type.toLowerCase()}`),
        )
        cy.get(`[data-testid^="data-table-row"]`).should('have.length.below', length)
        cy.get(`[data-testid="chip-${otherType.toLowerCase()}"]`).click()
        cy.url().should('include', `type=${type},${otherType}`)
        cy.get(`[data-testid^="data-table-row"]`).should('have.length', length)
      }),
    ))

  it(`should copy the market address`, RETRY_IN_CI, () => {
    expandFirstRowOnMobile(breakpoint)
    // unfortunately we need to click twice on Chromium, the first one doesn't work (maybe due to the tooltip)
    range(2).forEach(() =>
      breakpoint === 'desktop'
        ? // on desktop, the copy button is not visible until hovered - but cypress doesn't support that so use force
          cy.get(`[data-testid^="copy-market-address"]`).first().click({ force: true })
        : cy.get(`[data-testid^="copy-market-address"]:visible`).first().click(),
    )
    cy.get(`[data-testid="copy-confirmation"]`).should('be.visible')
  })

  it(`should navigate to market details`, () => {
    const [type, urlRegex] = oneOf(
      ['mint', /\/crvusd\/\w+\/markets\/[\w-]+\/?$/],
      ['lend', /\/lend\/\w+\/markets\/.+\/?$/],
    )
    withFilterChips(breakpoint, () => {
      cy.get(`[data-testid="chip-${type}"]`).click()
      return firstRow().contains(lodash.capitalize(type))
    })
    cy.get(`[data-testid^="market-link-"]`).first().click()
    if (breakpoint === 'mobile') {
      cy.get(`[data-testid^="llama-market-go-to-market"]:visible`).click()
    }
    cy.url(LOAD_TIMEOUT).should('match', urlRegex)
  })

  it(`should allow filtering by rewards`, { scrollBehavior: false }, () => {
    cy.get(`[data-testid^="data-table-row"]`).should('have.length.at.least', 1)
    withFilterChips(breakpoint, () => {
      cy.get(`[data-testid="chip-rewards"]`).click()
      return cy.get(`[data-testid^="data-table-row"]`).should('have.length', 1)
    })
    expandFirstRowOnMobile(breakpoint)
    cy.get(`[data-testid="rewards-icons"]`).should('be.visible')
    withFilterChips(breakpoint, () => {
      cy.get(`[data-testid="chip-rewards"]`).click()
      return cy.get(`[data-testid^="data-table-row"]`).should('have.length.above', 1)
    })
  })

  it('should hide columns', () => {
    if (breakpoint == 'mobile') {
      // mobile viewports do not have this feature
      cy.viewport(...oneDesktopViewport())
    }
    const { toggle, element } = oneOf(
      { toggle: 'tvl', element: 'data-table-header-tvl' },
      { toggle: 'liquidityUsd', element: 'data-table-header-liquidityUsd' },
      { toggle: 'utilizationPercent', element: 'data-table-header-utilizationPercent' },
    )
    cy.get(`[data-testid="${element}"]`).first().scrollIntoView()
    cy.get(`[data-testid="${element}"]`).should('be.visible')
    cy.get(`[data-testid="btn-visibility-settings"]`).click()
    cy.get(`[data-testid="visibility-toggle-${toggle}"]`).click()
    cy.get(`[data-testid="${element}"]`).should('not.exist')
  })

  it('should display Borrow APR by default', () => {
    const borrowColumnId = LlamaMarketColumnId.BorrowRate

    if (breakpoint === 'mobile') {
      // On mobile, expand the first row and check the metric is visible in the expanded panel
      expandFirstRowOnMobile(breakpoint)
      cy.get('[data-testid="data-table-expansion-row"]').contains('Borrow APR').should('be.visible')
      cy.get('[data-testid="data-table-expansion-row"]').contains('%').should('be.visible')
    } else {
      // On tablet/desktop, the column header and cell should be visible by default
      cy.get(`[data-testid="data-table-header-${borrowColumnId}"]`).should('be.visible')
      cy.get(`[data-testid="data-table-cell-${borrowColumnId}"]`).first().should('be.visible')
      cy.get(`[data-testid="data-table-cell-${borrowColumnId}"]`).first().contains('%')
    }
  })

  function checkLineGraphColor(type: MarketRateType, color: string) {
    // the graphs are lazy loaded, so we need to scroll to them first before checking the color
    if (breakpoint != 'mobile') {
      // no need to scroll on mobile, the graph is already in view after collapsing the row
      cy.get(`[data-testid="line-graph-${type}"]:visible`).first().scrollIntoView()
    }
    cy.get(`[data-testid="line-graph-${type}"] path`).first().should('have.attr', 'stroke', color)
  }

  function checkCoinSelection(type: TokenType) {
    const symbol = oneOf(
      ...vaultData.ethereum.data
        .filter((d) => d.total_assets_usd - d.total_debt_usd > SMALL_POOL_TVL)
        .map((d) => d[`${type}_token`].symbol),
    )
    const columnId = `assets_${type}_symbol`
    cy.get(`[data-testid="multi-select-filter-${columnId}"]`).click() // open the menu
    cy.get(`[data-testid="multi-select-clear"]`).click() // deselect previously selected tokens
    cy.get(`[data-testid="menu-${columnId}"]`).should('not.exist') // clicking on clear closes the menu
    cy.get(`[data-testid="multi-select-filter-${columnId}"]`).click() // open the menu again
    cy.get(`[data-testid="menu-${columnId}"] [value="${symbol}"]`).click() // select the token
    cy.get('body').click(0, 0) // close popover

    cy.get(`[data-testid="data-table-cell-assets"] [data-testid^="token-icon-${symbol}"]`).should('exist') // token might be hidden behind other tokens
    cy.url().should('include', `assets_${type}_symbol=${encodeURIComponent(symbol)}`)

    cy.get(`[data-testid="multi-select-filter-${columnId}"]`).click() // open the menu
    cy.get(`[data-testid="multi-select-clear"]`).click() // deselect previously selected tokens
    cy.url().should('not.include', `assets_${type}_symbol`)
  }
})

function visitAndWait([width, height]: [number, number, Breakpoint], options?: Partial<Cypress.VisitOptions>) {
  cy.viewport(width, height)
  cy.visit('/llamalend/ethereum/markets/', { ...LOAD_TIMEOUT, ...options })
  cy.get('[data-testid="data-table"]', LOAD_TIMEOUT).should('be.visible')
}

function enableGraphColumn() {
  cy.get(`[data-testid="line-graph-${MarketRateType.Borrow}"]`).should('not.exist')
  cy.get(`[data-testid="btn-visibility-settings"]`).click()
  cy.get(`[data-testid="visibility-toggle-borrowChart"]`).click()
  cy.get(`[data-testid="line-graph-${MarketRateType.Borrow}"]`).first().scrollIntoView()
}

function setupMocks() {
  const generatedData = createLendingVaultChainsResponse()
  mockTokenPrices()
  mockLendingVaults(generatedData)
  mockLendingSnapshots().as('lend-snapshots')
  mockMintMarkets()
  mockMintSnapshots()
  mockMerklCampaigns()
  console.info(JSON.stringify({ generatedData })) // for debugging ci failures
  return generatedData
}

const getMaxLiquidity = (vaultData: Record<Chain, GetMarketsResponse>) =>
  max(
    recordValues(vaultData).flatMap(({ data }) =>
      data.map(({ total_assets_usd, total_debt_usd }) => total_assets_usd - total_debt_usd),
    ),
  ) ?? 0

const getMaxTvl = (vaultData: Record<Chain, GetMarketsResponse>) =>
  max(
    recordValues(vaultData).flatMap(({ data }) =>
      data.map(
        ({ borrowed_balance_usd, collateral_balance_usd, total_assets_usd, total_debt_usd }) =>
          borrowed_balance_usd + collateral_balance_usd + total_assets_usd - total_debt_usd,
      ),
    ),
  ) ?? 0
