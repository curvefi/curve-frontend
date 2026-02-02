/* eslint-disable @typescript-eslint/no-unused-expressions */
import { orderBy } from 'lodash'
import { oneOf } from '@cy/support/generators'
import { getHiddenCount, toggleSmallPools, withFilterChips } from '@cy/support/helpers/data-table.helpers'
import { setShowSmallPools } from '@cy/support/helpers/user-profile'
import { API_LOAD_TIMEOUT, type Breakpoint, LOAD_TIMEOUT, oneViewport } from '@cy/support/ui'
import { SMALL_POOL_TVL } from '@ui-kit/features/user-profile/store'

const PATH = 'dex/arbitrum/pools/'

// Parse compact USD strings like "$1.2M", "$950K", "$0", "-"
function parseCompactUsd(value: string): number {
  if (['', '-', '—'].includes(value)) return 0
  const match = /(\d+\.?\d*)([kmbt]?)/i.exec(value)
  if (!match) {
    throw new Error(`Cannot match ${value} as compact USD number`)
  }
  const [, numStr, unit] = match
  const units = ['', 'k', 'm', 'b', 't']
  const num = +numStr
  const unitIndex = units.indexOf(unit.toLowerCase())
  if (unitIndex < 0 || isNaN(num)) {
    throw new Error(`Cannot parse ${value} as compact USD number`)
  }
  return num * 10 ** (unitIndex * 3)
}

function visitAndWait(
  width: number,
  height: number,
  options?: { query?: Record<string, string> } & Partial<Cypress.VisitOptions>,
) {
  cy.viewport(width, height)
  const { query } = options ?? {}
  cy.visitWithoutTestConnector(`${PATH}${query ? `?${new URLSearchParams(query)}` : ''}`, options)
  cy.get('[data-testid^="data-table-row-"]', API_LOAD_TIMEOUT).should('have.length.greaterThan', 0)
  if (query?.['page']) {
    cy.get('[data-testid="table-pagination"]').should('be.visible')
  }
}

type UsdValue = { text: string; parsed: number }

const expectOrder = (actual: UsdValue[], order: 'asc' | 'desc') =>
  expect(JSON.stringify(actual), `Table values should be in ${order} order`).to.equal(
    JSON.stringify(orderBy(actual, 'parsed', order)),
  )

const getTopUsdValues = (columnId: 'volume' | 'tvl') =>
  cy
    .get(`[data-testid="data-table-cell-${columnId}"]`)
    .then(($cells) =>
      Cypress.$.makeArray($cells).map(
        ({ innerText }): UsdValue => ({ text: innerText, parsed: parseCompactUsd(innerText) }),
      ),
    )

describe('DEX Pools', () => {
  let breakpoint: Breakpoint
  let width: number, height: number

  beforeEach(() => {
    ;[width, height, breakpoint] = oneViewport()
  })

  describe('First page', () => {
    beforeEach(() => visitAndWait(width, height))

    function sortBy(field: string, expectedOrder: 'asc' | 'desc' | false) {
      if (breakpoint === 'mobile') {
        cy.get('[data-testid="btn-drawer-sort-dex-pools"]').click()
        cy.get(`[data-testid="drawer-sort-menu-dex-pools"] li[value="${field}"]`).click()
        cy.get('[data-testid="drawer-sort-menu-dex-pools"]').should('not.be.visible')
      } else {
        cy.get(`[data-testid="data-table-header-${field}"]`).click()
        cy.get('[data-testid="drawer-sort-menu-dex-pools"]').should('not.exist')
      }
      if (expectedOrder) {
        cy.get(`[data-testid="icon-sort-${field}-${expectedOrder}"]`).should('be.visible')
      } else {
        cy.get(`[data-testid^="icon-sort-${field}"]`).should('not.exist')
      }
    }

    /**
     * Clicks on the given filter chip, opening the drawer on mobile if needed.
     * Not using `withFilterChips` because the drawer closes automatically in this case.
     */
    function clickFilterChip(chip: string, isMobile = breakpoint === 'mobile') {
      if (isMobile) {
        cy.get('[data-testid="btn-drawer-filter-dex-pools"]').click()
        cy.get('[data-testid="drawer-filter-menu-dex-pools"]').should('be.visible')
      }
      cy.get(`[data-testid="filter-chip-${chip}"]`).click()
      cy.get('[data-testid="drawer-filter-menu-dex-pools"]').should(isMobile ? 'not.be.visible' : 'not.exist')
    }

    it('sorts by volume', () => {
      getTopUsdValues('volume').then((vals) => expectOrder(vals, 'desc')) // initial is Volume desc
      cy.url().should('not.include', 'volume') // initial sort not in URL
      if (breakpoint === 'mobile') return // on mobile, we cannot sort ascending at the moment
      sortBy('volume', 'asc')
      getTopUsdValues('volume').then((vals) => expectOrder(vals, 'asc'))
      cy.url().should('include', 'sort=volume')
    })

    it('sorts by TVL (desc/asc)', () => {
      cy.url().should('not.include', 'tvl') // initial sort not in URL
      sortBy('tvl', 'desc')
      getTopUsdValues('tvl').then((vals) => expectOrder(vals, 'desc'))
      cy.url().should('include', 'sort=-tvl')
      if (breakpoint === 'mobile') return // on mobile, we cannot sort ascending at the moment
      sortBy('tvl', 'asc')
      getTopUsdValues('tvl').then((vals) => expectOrder(vals, 'asc'))
      cy.url().should('include', 'sort=tvl')
    })

    it('filters by currency chip', () => {
      const currency = oneOf('usd', 'btc')
      getHiddenCount(breakpoint).then((beforeCount) => {
        expect(isNaN(+beforeCount), `Cannot parse hidden count ${beforeCount}`).to.be.false
        clickFilterChip(currency)
        getHiddenCount(breakpoint).then((afterCount) => {
          expect(+afterCount).to.be.greaterThan(+beforeCount)
          // chip is in the drawer for mobile, check on desktop that we show count
          if (breakpoint !== 'mobile') cy.get(`[data-testid="filter-chip-${currency}"]`).contains(/\(\d+\)/)
        })
        cy.get('[data-testid="data-table-cell-PoolName"]').contains(currency.toUpperCase())
      })
    })

    it('navigates to pool deposit page by clicking a row', () => {
      cy.get('[data-testid^="data-table-row-"]').first().click()
      if (breakpoint === 'mobile') {
        cy.get('[data-testid="collapse-icon"]').first().should('be.visible')
        cy.get('[data-testid="pool-link-deposit"]').click()
      }
      cy.url(LOAD_TIMEOUT).should('match', /\/dex\/arbitrum\/pools\/[^/]+\/(deposit|swap)\/?$/)
      cy.title().should('match', /Curve - Pool - .* - Curve/)
    })
  })

  it('persists currency filter across reload', () => {
    const filter = oneOf('usd', 'btc')
    visitAndWait(width, height, { query: { filter } })
    cy.get('[data-testid^="data-table-row-"]', API_LOAD_TIMEOUT).should('have.length.greaterThan', 0)
    cy.url().should('include', `filter=${filter}`)
    cy.get('[data-testid="data-table-cell-PoolName"]').first().contains(filter.toUpperCase())
    withFilterChips(breakpoint, () => cy.get(`[data-testid="reset-filter"]`).click())
    cy.url().should('not.include', '?')
  })

  it('paginates', () => {
    const getPages = ($buttons: JQuery) =>
      Cypress.$.makeArray($buttons).map((el) => el.dataset.testid?.replace('btn-page-', ''))

    // open page 5 (1-based)
    visitAndWait(width, height, {
      query: { page: '5' },
      // show small pools so we have more pages to test with, and the tests are more stable
      onBeforeLoad: (win) => setShowSmallPools(win.localStorage),
    })

    // Current page selected
    cy.get('[data-testid="btn-page-5"]').should('have.class', 'Mui-selected')
    cy.get('[data-testid^="btn-page-"]').then(($buttons) => {
      const [prevLastPage, lastPage] = [$buttons.length - 1, $buttons.length]
      expect(getPages($buttons)).to.deep.equal([
        'prev',
        '1',
        '2',
        'ellipsis',
        '4',
        '5',
        '6',
        'ellipsis',
        `${prevLastPage}`,
        `${lastPage}`,
        'next',
      ])

      // click on the first page and check again
      cy.get('[data-testid="btn-page-1"]').click()
      cy.url().should('not.include', `page`)
      cy.get('[data-testid^="btn-page-"]').then(($buttons) =>
        expect(getPages($buttons)).to.deep.equal(['1', '2', 'ellipsis', `${prevLastPage}`, `${lastPage}`, 'next']),
      )

      // click on the last page and check again
      cy.get(`[data-testid="btn-page-${lastPage}"]`).click()
      cy.url().should('include', `?page=${lastPage}`)
      cy.get('[data-testid^="btn-page-"]').then(($buttons) =>
        expect(getPages($buttons)).to.deep.equal(['prev', '1', '2', 'ellipsis', `${prevLastPage}`, `${lastPage}`]),
      )
    })
  })

  it('filters small pools', () => {
    // by default, small pools are hidden, if we sort by TVL (asc), we should see only pools above the threshold
    visitAndWait(width, height, { query: { sort: 'tvl' } })
    getTopUsdValues('tvl').then((vals) =>
      expect(JSON.stringify(vals.filter((v) => v.parsed < SMALL_POOL_TVL))).to.equal('[]'),
    )
    toggleSmallPools(breakpoint)
    // now for sure there is at least one empty TVL pool
    cy.get(`[data-testid="data-table-cell-tvl"]`).first().contains('$0')
    getTopUsdValues('tvl').then((vals) =>
      expect(JSON.stringify(vals.filter((v) => v.parsed < SMALL_POOL_TVL))).to.not.equal('[]'),
    )
  })
})
