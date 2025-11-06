import lodash from 'lodash'
import type { GetMarketsResponse } from '@curvefi/prices-api/llamalend'
import { range } from '@curvefi/prices-api/objects.util'
import { oneOf, shuffle, type TokenType } from '@cy/support/generators'
import {
  Chain,
  createLendingVaultChainsResponse,
  HighTVLAddress,
  HighUtilizationAddress,
  mockLendingSnapshots,
  mockLendingVaults,
} from '@cy/support/helpers/lending-mocks'
import { LLAMA_FILTERS_V1, LLAMA_VISIBILITY_SETTINGS_V0 } from '@cy/support/helpers/llamalend-storage'
import { mockMintMarkets, mockMintSnapshots } from '@cy/support/helpers/minting-mocks'
import { mockTokenPrices } from '@cy/support/helpers/tokens'
import {
  assertInViewport,
  assertNotInViewport,
  type Breakpoint,
  LOAD_TIMEOUT,
  oneDesktopViewport,
  oneViewport,
  RETRY_IN_CI,
} from '@cy/support/ui'
import { SMALL_POOL_TVL } from '@ui-kit/features/user-profile/store'
import { MarketRateType } from '@ui-kit/types/market'

describe(`LlamaLend Markets`, () => {
  let breakpoint: Breakpoint
  let width: number, height: number
  let vaultData: Record<Chain, GetMarketsResponse>

  beforeEach(() => {
    ;[width, height, breakpoint] = oneViewport()
    vaultData = setupMocks()
    visitAndWait([width, height, breakpoint])
  })

  const firstRow = () => cy.get(`[data-testid^="data-table-row-"]`).first()
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
    cy.get(`[data-testid^="data-table-row"]`)
      .first()
      .find(`[data-testid="market-link-${HighTVLAddress}"]`)
      .should('exist')
    withFilterChips(() => {
      cy.get(`[data-testid="chip-lend"]`).click()
      cy.get(`[data-testid="pool-type-mint"]`).should('not.exist')
    })
    if (breakpoint == 'mobile') {
      cy.get(`[data-testid="data-table-cell-tvl"]`).first().contains('$')
      openDrawer('sort')
      cy.get('[data-testid="drawer-sort-menu-lamalend-markets"]').contains('Utilization', LOAD_TIMEOUT)
      cy.get('[data-testid="drawer-sort-menu-lamalend-markets"] li[value="utilizationPercent"]').click()
      cy.get('[data-testid="drawer-sort-menu-lamalend-markets"]').should('not.be.visible')
      cy.get(`[data-testid^="data-table-row"]`)
        .first()
        .find(`[data-testid="market-link-${HighUtilizationAddress}"]`)
        .should('exist')
      expandFirstRowOnMobile()
      // note: not possible currently to sort ascending
      cy.get('[data-testid="metric-utilizationPercent"]').contains('99%', LOAD_TIMEOUT)
    } else {
      cy.get(`[data-testid="data-table-cell-rates_borrow"]`).first().contains('%')
      cy.get('[data-testid="data-table-header-utilizationPercent"]').click()
      cy.get('[data-testid="data-table-cell-utilizationPercent"]').first().contains('99%', LOAD_TIMEOUT)
      cy.get('[data-testid="data-table-header-utilizationPercent"]').click()
      cy.get('[data-testid="data-table-cell-utilizationPercent"]').first().contains('0%', LOAD_TIMEOUT)
    }
  })

  // todo: retry cause this fails in large screens with small data set (laziness not triggered, everything is shown)
  it('should show charts', RETRY_IN_CI, () => {
    withFilterChips(() => {
      cy.get(`[data-testid="chip-lend"]`).click()
      cy.get(`[data-testid="pool-type-mint"]`).should('not.exist')
    })
    expandFirstRowOnMobile()
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
    cy.get("[data-testid='table-text-search-Llamalend Markets']").type('wstETH crvUSD')
    cy.scrollTo(0, 0)
    // sfrxETH market is filtered out
    cy.get(`[data-testid='market-link-0x136e783846ef68C8Bd00a3369F787dF8d683a696']`).should('not.exist')
    // wstETH market is shown
    cy.get(`[data-testid="market-link-0x37417B2238AA52D0DD2D6252d989E728e8f706e4"]`).should('exist')
  })

  it(`should allow filtering by using a slider`, () => {
    const [columnId, initialFilterText] = oneOf(
      ['liquidityUsd', '$0 -'],
      ['tvl', '$10k -'],
      ['utilizationPercent', '0% -'],
    )
    // Keep the viewport stable for slider width.
    const [width, height, breakpoint] = oneOf([1200, 800, 'desktop'], [500, 800, 'mobile'])
    cy.viewport(width, height)
    cy.get(`[data-testid^="data-table-row"]`).then(({ length }) => {
      cy.get(`[data-testid="minimum-slider-filter-${columnId}"]`).should('not.be.visible')
      // Expand the filters
      if (breakpoint == 'mobile') {
        openDrawer('filter')
      } else {
        cy.get(`[data-testid="btn-expand-filters"]`).click({ waitForAnimations: true })
      }
      cy.get(`[data-testid="minimum-slider-filter-${columnId}"]`).should('contain', initialFilterText)
      cy.get(`[data-testid="slider-${columnId}"]`).should('not.exist')
      cy.get(`[data-testid="minimum-slider-filter-${columnId}"]`).click({ waitForAnimations: true })
      cy.get(`[data-testid="slider-${columnId}"]`).should('be.visible')
      cy.get(`[data-testid="slider-${columnId}"]`).then(($el) => {
        const width = $el.width() ?? 80
        const height = $el.height() ?? 24
        // With log slider a click from the left is not enough to filter
        // Click 20px from the right edge and vertically centered
        cy.wrap($el).click(width - 20, height / 2, { waitForAnimations: true })
      })
      // close the select menu
      cy.get('body').click(0, 0, { waitForAnimations: true })
      cy.get(`[data-testid="slider-${columnId}"]`).should('not.exist')
      cy.get(`[data-testid^="data-table-row"]`).should('have.length.below', length)
    })
  })

  it(`should allow filtering by using a slider input`, () => {
    const [columnId, newValue] = oneOf(['liquidityUsd', '30000000'], ['tvl', '80000000'], ['utilizationPercent', '80'])
    // Keep the viewport stable for slider width.
    const [width, height, breakpoint] = oneOf([1200, 800, 'desktop'], [500, 800, 'mobile'])
    cy.viewport(width, height)
    cy.get(`[data-testid^="data-table-row"]`).then(({ length }) => {
      cy.get(`[data-testid="minimum-slider-filter-${columnId}"]`).should('not.be.visible')
      // Expand the filters
      if (breakpoint == 'mobile') {
        openDrawer('filter')
      } else {
        cy.get(`[data-testid="btn-expand-filters"]`).click({ waitForAnimations: true })
      }
      //  open the chosen filter
      cy.get(`[data-testid="minimum-slider-filter-${columnId}"]`).click({ waitForAnimations: true })
      cy.get(`[data-testid="slider-${columnId}"]`).should('be.visible')

      // Always type into the right input when the slider has a range.
      cy.get(`[data-testid="slider-${columnId}"]`)
        .closest('[role="presentation"]')
        .find('input[type="text"]')
        .then(($inputs) => {
          const target = $inputs.length > 1 ? $inputs.eq($inputs.length - 1) : $inputs.eq(0)
          cy.wrap(target).click().type('{selectAll}').type(newValue).blur()
        })

      // Close the menu
      cy.get('body').click(0, 0, { waitForAnimations: true })
      closeDrawer()
      cy.get(`[data-testid="slider-${columnId}"]`).should('not.exist')
      cy.get(`[data-testid^="data-table-row"]`).should('have.length.below', length)
    })
  })

  it('should allow filtering by chain', () => {
    const chains = Object.keys(vaultData)
    const chain = oneOf(...chains)
    cy.get(`[data-testid="chip-chain-${chain}"]`).click()

    cy.get(`[data-testid="data-table-cell-assets"]:first [data-testid="chain-icon-${chain}"]`).should('be.visible')

    const otherChain = oneOf(...chains.filter((c) => c !== chain))
    cy.get(`[data-testid="chip-chain-${otherChain}"]`).click()
    ;[chain, otherChain].forEach((c) => cy.get(`[data-testid="chain-icon-${c}"]`).should('be.visible'))
  })

  it(`should allow filtering by token`, () => {
    const tokenField = 'collateral_token'
    if (breakpoint == 'mobile') {
      openDrawer('filter')
    } else {
      cy.get(`[data-testid="btn-expand-filters"]`).click()
    }

    const collateralCoins = vaultData.ethereum.data
      .filter((d) => d.total_assets_usd - d.total_debt_usd > SMALL_POOL_TVL)
      .map((d) => d[tokenField].symbol)

    const collateral = oneOf(...collateralCoins)
    const borrowed = oneOf('CRV', 'crvUSD')

    selectCoin(collateral, 'collateral')
    selectCoin(borrowed, 'borrowed')
  })

  it('should allow filtering favorites', { scrollBehavior: false }, () => {
    if (breakpoint == 'mobile') {
      openDrawer('filter')
    }
    // on desktop, the favorite icon is not visible until hovered - but cypress doesn't support that so use force
    cy.get(`[data-testid="favorite-icon"]`).first().click({ force: true })

    closeDrawer()
    withFilterChips(() => cy.get(`[data-testid="chip-favorites"]`).click())
    cy.get(`[data-testid^="data-table-row"]`).should('have.length', 1)
    cy.get(`[data-testid="favorite-icon"]:visible`).should('not.exist')
    cy.get(`[data-testid="favorite-icon-filled"]:visible`).click()
    cy.get(`[data-testid="table-empty-row"]`).should('exist')
    withFilterChips(() => cy.get(`[data-testid="reset-filter"]`).click())
    cy.get(`[data-testid^="data-table-row"]`).should('have.length.above', 1)
  })

  it(`should allow filtering by market type`, () =>
    withFilterChips(() =>
      cy.get(`[data-testid^="data-table-row"]`).then(({ length }) => {
        const [type, otherType] = shuffle('mint', 'lend')
        cy.get(`[data-testid="chip-${type}"]`).click()
        cy.get(`[data-testid^="pool-type-"]`).each(($el) => expect($el.attr('data-testid')).equals(`pool-type-${type}`))
        cy.get(`[data-testid^="data-table-row"]`).should('have.length.below', length)
        cy.get(`[data-testid="chip-${otherType}"]`).click()
        cy.get(`[data-testid^="data-table-row"]`).should('have.length', length)
      }),
    ))

  it(`should copy the market address`, RETRY_IN_CI, () => {
    if (breakpoint === 'mobile') {
      expandFirstRowOnMobile()
    }
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
      ['mint', /\/crvusd\/\w+\/markets\/.+\/create/],
      ['lend', /\/lend\/\w+\/markets\/.+\/create/],
    )
    withFilterChips(() => {
      cy.get(`[data-testid="chip-${type}"]`).click()
      firstRow().contains(lodash.capitalize(type))
    })
    cy.get(`[data-testid^="market-link-"]`).first().click()
    if (breakpoint === 'mobile') {
      cy.get(`[data-testid^="llama-market-go-to-market"]:visible`).click()
    }
    cy.url(LOAD_TIMEOUT).should('match', urlRegex)
  })

  it(`should allow filtering by rewards`, { scrollBehavior: false }, () => {
    cy.get(`[data-testid^="data-table-row"]`).should('have.length.at.least', 1)
    withFilterChips(() => {
      cy.get(`[data-testid="chip-rewards"]`).click()
      cy.get(`[data-testid^="data-table-row"]`).should('have.length', 1)
    })
    expandFirstRowOnMobile()
    cy.get(`[data-testid="rewards-icons"]`).should('be.visible')
    withFilterChips(() => {
      cy.get(`[data-testid="chip-rewards"]`).click()
      cy.get(`[data-testid^="data-table-row"]`).should('have.length.above', 1)
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

  function expandFirstRowOnMobile() {
    if (breakpoint == 'mobile') {
      cy.get(`[data-testid="expand-icon"]`).first().click()
      cy.get(`[data-testid="data-table-expansion-row"]`).should('be.visible')
    }
  }

  function openDrawer(type: 'filter' | 'sort') {
    cy.get(`[data-testid="btn-drawer-${type}-lamalend-markets"]`).click({ waitForAnimations: true })
  }

  function closeDrawer() {
    if (breakpoint == 'mobile') {
      cy.get('body').click(0, 0)
    }
  }

  /**
   * Makes sure that the filter chips are visible during the given callback.
   * On mobile, the filters are hidden behind a button and need to be expanded for some actions.
   */
  function withFilterChips(callback: () => void) {
    if (breakpoint != 'mobile') {
      return callback()
    }
    cy.scrollTo(0, 0)
    cy.get(`[data-testid="chip-lend"]`).should('not.be.visible')
    cy.get(`[data-testid="btn-drawer-filter-lamalend-markets"]`).click({ waitForAnimations: true })
    cy.get(`[data-testid="chip-lend"]`).should('be.visible')
    callback()
    cy.scrollTo(0, 0)
    cy.get(`[data-testid="chip-lend"]`).should('be.visible')
    cy.get('body').click(0, 0)
    cy.get(`[data-testid="chip-lend"]`).should('not.be.visible')
  }

  function checkLineGraphColor(type: MarketRateType, color: string) {
    // the graphs are lazy loaded, so we need to scroll to them first before checking the color
    if (breakpoint != 'mobile') {
      // no need to scroll on mobile, the graph is already in view after collapsing the row
      cy.get(`[data-testid="line-graph-${type}"]:visible`).first().scrollIntoView()
    }
    cy.get(`[data-testid="line-graph-${type}"] path`).first().should('have.attr', 'stroke', color)
  }
})

describe(`LlamaLend Storage Migration`, () => {
  beforeEach(() => {
    setupMocks()
  })

  it('migrates old filter to remove deprecated markets', () => {
    visitAndWait(oneViewport(), {
      onBeforeLoad({ localStorage }) {
        localStorage.clear()
        localStorage.setItem('table-filters-llamalend-markets-v1', JSON.stringify(LLAMA_FILTERS_V1))
      },
    })
    cy.window().then(({ localStorage }) => {
      expect(localStorage.getItem('table-filters-llamalend-markets-v1')).to.be.null
      const newValue = JSON.parse(localStorage.getItem('table-filters-llamalend-markets-v2')!)
      expect(newValue).to.deep.equal([{ id: 'deprecatedMessage', value: false }, ...LLAMA_FILTERS_V1])
    })
  })

  it('migrates old visibility settings', () => {
    visitAndWait(oneViewport(), {
      onBeforeLoad({ localStorage }) {
        localStorage.clear()
        localStorage.setItem('table-column-visibility-llamalend-markets', JSON.stringify(LLAMA_VISIBILITY_SETTINGS_V0))
      },
    })
    cy.window().then(({ localStorage }) => {
      expect(localStorage.getItem('table-column-visibility-llamalend-markets')).to.be.null
      const migrated = JSON.parse(localStorage.getItem('table-column-visibility-llamalend-markets-v1')!)
      expect(Object.keys(migrated)).to.deep.equal(['Borrow', 'Supply', 'hasPositions', 'noPositions', 'unknown'])
    })
  })
})

function visitAndWait([width, height]: [number, number, Breakpoint], options?: Partial<Cypress.VisitOptions>) {
  cy.viewport(width, height)
  cy.visit('/llamalend/ethereum/markets/', { ...LOAD_TIMEOUT, ...options })
  cy.get('[data-testid="data-table"]', LOAD_TIMEOUT).should('be.visible')
}

const selectCoin = (symbol: string, type: TokenType) => {
  const columnId = `assets_${type}_symbol`
  cy.get(`[data-testid="multi-select-filter-${columnId}"]`).click() // open the menu
  cy.get(`[data-testid="multi-select-clear"]`).click() // deselect previously selected tokens
  cy.get(`[data-testid="menu-${columnId}"]`).should('not.exist') // clicking on clear closes the menu
  cy.get(`[data-testid="multi-select-filter-${columnId}"]`).click() // open the menu again
  cy.get(`[data-testid="menu-${columnId}"] [value="${symbol}"]`).click() // select the token
  cy.get('body').click(0, 0) // close popover
  cy.get(`[data-testid="data-table-cell-assets"] [data-testid^="token-icon-${symbol}"]`).should('exist') // token might be hidden behind other tokens

  cy.get(`[data-testid="multi-select-filter-${columnId}"]`).click() // open the menu
  cy.get(`[data-testid="multi-select-clear"]`).click() // deselect previously selected tokens
}

function enableGraphColumn() {
  cy.get(`[data-testid="line-graph-${MarketRateType.Borrow}"]`).should('not.exist')
  cy.get(`[data-testid="btn-visibility-settings"]`).click()
  cy.get(`[data-testid="visibility-toggle-borrowChart"]`).click()
  cy.get(`[data-testid="line-graph-${MarketRateType.Borrow}"]`).first().scrollIntoView()
}

function setupMocks() {
  const vaultData = createLendingVaultChainsResponse()
  mockTokenPrices()
  mockLendingVaults(vaultData)
  mockLendingSnapshots().as('lend-snapshots')
  mockMintMarkets()
  mockMintSnapshots()
  return vaultData
}
