import { sum } from 'lodash'
import { LlamaMarketColumnId } from '@/llamalend/features/market-list/columns/columns.enum'
import type { GetMarketsResponse } from '@curvefi/prices-api/llamalend'
import { oneOf, shuffle } from '@cy/support/generators'
import {
  expandFirstRowOnMobile,
  getTableCellAssets,
  openDrawer,
  withFilters,
} from '@cy/support/helpers/data-table.helpers'
import { Chain, HighTVLAddress, HighUtilizationAddress } from '@cy/support/helpers/lending-mocks'
import {
  checkChainSelection,
  checkCoinSelection,
  checkLineGraphColor,
  checkTableFilterButtonGroupSelection,
  enableGraphColumn,
  filterByMarketType,
  getOneColumnMedianValue,
  typeFilterInput,
  visitAndWait,
} from '@cy/support/helpers/llamalend/llamalend-markets'
import { setupLlamalendListMocks } from '@cy/support/helpers/llamalend/market-list-mocks'
import { assertInViewport, assertNotInViewport, LOAD_TIMEOUT, oneDesktopViewport, oneViewport } from '@cy/support/ui'
import { assert, notFalsy, objectKeys, recordValues, repeat } from '@primitives/objects.utils'
import { LlamaMarketType, LlamaMarketVersion, MarketRateType } from '@ui-kit/types/market'

const wstEthMarket = '0x100dAa78fC509Db39Ef7D04DE0c1ABD299f4C6CE' as const
const sfrxEthMarket = '0x8472A9A7632b173c8Cf3a86D3afec50c35548e76' as const

const testCases = [oneViewport()] as const

testCases.forEach(([width, height, breakpoint]) => {
  describe(`LlamaLend Markets`, () => {
    let vaultData: Record<Chain, GetMarketsResponse>
    const itSkipOnMobile = breakpoint === 'mobile' ? it.skip : it

    beforeEach(() => {
      ;({ vaultData } = setupLlamalendListMocks())
      visitAndWait([width, height])
    })

    it(`should copy the market address`, () => {
      expandFirstRowOnMobile(breakpoint)
      cy.get(
        notFalsy(
          breakpoint === 'mobile' && `[data-testid="data-table-expansion-row"]`,
          `[data-testid^="copy-market-address"]`,
        ).join(' '),
      )
        .first()
        // on desktop, the copy button is not visible until hovered - but cypress doesn't support that so use force
        .click({ force: breakpoint === 'desktop' })
      cy.get(`[data-testid="copy-confirmation"]`).should('be.visible')
    })

    it(`should navigate to the market details`, () => {
      const [type, urlRegex] = oneOf(
        [LlamaMarketType.Mint, /\/crvusd\/\w+\/markets\/[\w-]+\/?$/],
        [LlamaMarketType.Lend, /\/lend\/\w+\/markets\/.+\/?$/],
      )
      filterByMarketType([width, height], type)
      cy.get(`[data-testid^="market-link-"]`).first().click()
      if (breakpoint === 'mobile') {
        cy.get(`[data-testid^="llama-market-go-to-market"]`).click()
      }
      cy.url(LOAD_TIMEOUT).should('match', urlRegex)
    })

    it('should have sticky headers', () => {
      cy.get('[data-testid^="data-table-row"]').last().then(assertNotInViewport)
      cy.get('[data-testid^="data-table-row"]').eq(10).scrollIntoView()
      cy.get('[data-testid="data-table-head"] th').eq(1).then(assertInViewport)
      cy.get(`[data-testid^="badge-market-type-"]`).should('be.visible') // wait for the table to render

      // filter height changes because text wraps depending on the width
      const filterHeight = {
        mobile: [48],
        tablet: [56],
        desktop: [56],
      }[breakpoint]
      cy.get('[data-testid="table-filters"]').invoke('outerHeight').should('be.oneOf', filterHeight)
      cy.get('[data-testid^="data-table-row"]').eq(10).invoke('outerHeight').should('equal', 65)
    })

    it('should hide columns', () => {
      if (breakpoint == 'mobile') {
        // mobile viewports do not have this feature
        const [width, height] = oneDesktopViewport()
        cy.viewport(width, height)
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

    it('should sort', () => {
      const utilizationColumnId = LlamaMarketColumnId.UtilizationPercent
      cy.get(`[data-testid^="data-table-row"]`)
        .first()
        .find(`[data-testid="market-link-${HighTVLAddress}"]`)
        .should('exist')
      if (breakpoint == 'mobile') {
        withFilters(breakpoint, () => {
          cy.get(`[data-testid="table-filter-btn-market-type-${LlamaMarketType.Lend}"]`).click()
          return cy.get(`[data-testid="badge-market-type-${LlamaMarketType.Mint}"]`).should('not.exist')
        })
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

    it('should show charts on ' + [breakpoint, [width, height].join('x')].join('/'), () => {
      const vaultCount = sum(recordValues(vaultData).map(d => d.data.length))

      filterByMarketType([width, height])
      if (breakpoint == 'mobile') {
        expandFirstRowOnMobile(breakpoint)
      } else {
        enableGraphColumn()
      }
      checkLineGraphColor(MarketRateType.Borrow, '#ed242f')

      cy.get(`@lend-snapshots.all`, LOAD_TIMEOUT).then(calls1 => {
        expect(calls1.length).to.be.greaterThan(0).lessThan(vaultCount) // make sure we have some calls before scrolling, but not all
        cy.wait(repeat('@lend-snapshots', calls1.length), LOAD_TIMEOUT)

        // check that scrolling loads more snapshots
        cy.get('[data-testid^="data-table-row"]')
          .last()
          .scrollIntoView({ offset: { top: -height / 2, left: 0 } }) // scroll to the last row, make sure it's still visible
        if (breakpoint == 'mobile') {
          cy.get(`[data-testid="expand-icon"]`).last().scrollIntoView()
          cy.get(`[data-testid="expand-icon"]`).last().click()
        }
        cy.get('[data-testid^="data-table-row"]').last().should('be.visible')
        cy.wait(`@lend-snapshots`, LOAD_TIMEOUT) // wait for an extra request
        cy.get('[data-testid^="data-table-row"]').last().should('contain.html', 'path') // wait for the graph to render
        cy.get(`@lend-snapshots.all`, LOAD_TIMEOUT).then(calls2 =>
          expect(calls2.length).to.be.greaterThan(calls1.length),
        )
      })
    })

    it('should find markets by text', () => {
      cy.get("[data-testid^='table-text-search-'] input").click()
      cy.get("[data-testid='table-text-search-Llamalend Markets'] input").type('wstETH crvUSD')
      cy.url().should('include', 'search=wstETH+crvUSD')
      cy.scrollTo(0, 0)
      cy.get(`[data-testid='market-link-${sfrxEthMarket}']`).should('not.exist')
      cy.get(`[data-testid="market-link-${wstEthMarket}"]`).should('exist')
    })

    it('should persists search filter across reload', () => {
      visitAndWait([width, height], `/llamalend/ethereum/markets/?search=wstETH+crvUSD`)
      cy.get("[data-testid='table-text-search-Llamalend Markets'] input").should('have.value', 'wstETH crvUSD')
      cy.get(`[data-testid="market-link-${wstEthMarket}"]`).should('exist')
      getTableCellAssets().first().contains('wstETH')
    })

    it('should allow filtering favorites', () => {
      expandFirstRowOnMobile(breakpoint)
      // on desktop, the favorite icon is not visible until hovered - but cypress doesn't support that so use force
      cy.get(`[data-testid="favorite-btn"]`).first().click({ force: true })

      cy.get(`[data-testid="chip-favorites"]`).click()
      cy.url().should('include', 'isFavorite=yes')
      cy.get(`[data-testid^="data-table-row"]`).should('have.length', 1)
      cy.get(`[data-testid="favorite-btn"]`).should('not.exist')
      cy.get(`[data-testid="favorite-btn-active"]`).click()
      cy.get(`[data-testid="table-empty-row"]`).should('exist')
    })

    it('should allow filtering by chain', () => {
      const chains = objectKeys(vaultData)
      const chain = oneOf(...chains)
      withFilters(breakpoint, () => cy.get(`[data-testid="chip-chain-${chain}"]`).click())
      checkChainSelection(chain)

      // filter by multiple chains at the same time
      const otherChain = oneOf(...chains.filter(c => c !== chain))
      withFilters(breakpoint, () => cy.get(`[data-testid="chip-chain-${otherChain}"]`).click())
      checkChainSelection(chain, otherChain)
    })

    it(`should allow filtering by token`, () => {
      checkCoinSelection(breakpoint, vaultData, 'collateral')
      checkCoinSelection(breakpoint, vaultData, 'borrowed')
    })

    it('should allow filtering by using a range inputs', () => {
      const [columnId, medianValue] = getOneColumnMedianValue(vaultData, [
        LlamaMarketColumnId.BorrowRate,
        LlamaMarketColumnId.Tvl,
        LlamaMarketColumnId.LiquidityUsd,
        LlamaMarketColumnId.UtilizationPercent,
      ])
      const bound = oneOf('min', 'max')
      cy.get(`[data-testid^="data-table-row"]`).then(({ length }) => {
        withFilters(breakpoint, () => typeFilterInput(`range-filter-${columnId}-${bound}`, medianValue).blur())
        cy.get(`[data-testid^="data-table-row"]`).should('have.length.below', length)
        cy.url().should('include', `${columnId}=`)
      })
    })

    it(`should allow filtering by using a slider and input`, () => {
      // Keep the viewport stable for slider width.
      if (breakpoint === 'mobile') {
        cy.viewport(500, 800)
      } else {
        cy.viewport(1200, 800)
      }
      const [columnId, medianValue] = getOneColumnMedianValue(vaultData, [LlamaMarketColumnId.MaxLtv])
      const bound = oneOf('min', 'max')

      // test the slider's input
      cy.get(`[data-testid^="data-table-row"]`).then(({ length }) => {
        withFilters(breakpoint, () => typeFilterInput(`slider-input-${columnId}-${bound}`, medianValue).blur())
        cy.get(`[data-testid^="data-table-row"]`).should('have.length.below', length)
        cy.url().should('include', `${columnId}=`)

        // reset the filters
        withFilters(breakpoint, () => cy.get(`[data-testid="btn-reset-filters"]`).click())
        cy.get(`[data-testid^="data-table-row"]`).should('have.length', length)

        // test the slider
        withFilters(breakpoint, () =>
          cy
            .get(`[data-testid="slider-${columnId}"]`)
            .as('slider')
            .then($el => {
              const sliderWidth = assert($el.width(), "The slider's width was not found")
              const sliderHeight = assert($el.height(), "The slider's height was not found")
              // we click ~75% percent of the slider range (from the left) and vertically centered
              return cy.get(`@slider`).click(sliderWidth * (3 / 4), sliderHeight / 2, { waitForAnimations: true })
            }),
        )
        cy.get(`[data-testid^="data-table-row"]`).should('have.length.below', length)
        cy.url().should('include', `${columnId}=`)
      })
    })

    it(`should allow filtering by market type`, () => {
      const marketTypes = shuffle(...recordValues(LlamaMarketType))
      marketTypes.forEach(type =>
        checkTableFilterButtonGroupSelection(breakpoint, type, 'type', () => {
          getTableCellAssets().find(`[data-testid="badge-market-type-${type}"]`).should('be.visible')
        }),
      )
    })

    it(`should allow filtering by market version`, () => {
      const marketVersions = shuffle(...recordValues(LlamaMarketVersion))
      marketVersions.forEach(version =>
        checkTableFilterButtonGroupSelection(breakpoint, version, 'version', () => {
          getTableCellAssets().find(`[data-testid="badge-market-version-${version}"]`).should('be.visible')
        }),
      )
    })

    it(`should reset filters when pressing the reset button`, () => {
      withFilters(breakpoint, () => cy.get(`[data-testid="btn-reset-filters"]`).should('be.disabled'))
      visitAndWait([width, height], `/llamalend/ethereum/markets?isFavorite=yes`)
      cy.get(`[data-testid="table-empty-row"]`).should('exist')
      withFilters(breakpoint, () => cy.get(`[data-testid="btn-reset-filters"]`).click())
      cy.url().should('not.include', 'isFavorite=')
      cy.get(`[data-testid^="data-table-row"]`).should('have.length.above', 1)
    })

    /** Filters collapsible is not shown on mobile */
    itSkipOnMobile('should show active filters in the collapsible', () => {
      withFilters(breakpoint, () => {
        cy.get(`[data-testid="table-filter-btn-market-version-${LlamaMarketVersion.v1}"]`).click()
        cy.get(`[data-testid="table-filter-btn-market-type-${LlamaMarketType.Lend}"]`).click()
        return cy.get(`[data-testid="chip-chain-ethereum"]`).click()
      })

      cy.get(`[data-testid="table-filters-collapsible"]`).as('collapsible')
      cy.get('@collapsible').find('[data-testid^="table-filters-collapsible-active-filter-"]').should('have.length', 3)

      cy.get(`[data-testid="table-filters-collapsible-reset-btn"]`).click()
      cy.get('@collapsible').should('not.be.visible')
      cy.url().should('not.include', `?`)
    })
  })
})
