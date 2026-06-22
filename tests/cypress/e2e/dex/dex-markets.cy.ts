import { orderBy } from 'lodash'
import { oneOf } from '@cy/support/generators'
import {
  DEX_POOL_LIST_NAVIGATION_POOL,
  DEX_POOL_LIST_SEARCH,
  setupDexPoolListMocks,
} from '@cy/support/helpers/dex-pool-list-mocks'
import { mockMerklCampaigns } from '@cy/support/helpers/lending-mocks'
import { API_LOAD_TIMEOUT, type Breakpoint, LOAD_TIMEOUT, oneViewport } from '@cy/support/ui'
import { assert } from '@primitives/objects.utils'

// Parse compact USD strings like "$1.2M", "$950K", "$0", "-"
function parseCompactUsd(value: string): number {
  if (['', '-', '—'].includes(value)) return 0
  const [, numStr, unit] = assert(/(\d+\.?\d*)([kmbt]?)/i.exec(value), `Cannot match ${value} as compact USD number`)
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
  {
    query,
    network = 'ethereum',
    ...options
  }: { network?: string; query?: Record<string, string> } & Partial<Cypress.VisitOptions> = {},
) {
  cy.viewport(width, height)
  cy.visitWithoutTestConnector(`dex/${network}/pools/${query ? `?${new URLSearchParams(query)}` : ''}`, options)
  cy.wait('@dex-pools', API_LOAD_TIMEOUT)
  cy.get('[data-testid^="data-table-row-"]', API_LOAD_TIMEOUT).should('have.length.greaterThan', 0)
  if (query?.page) {
    cy.get('[data-testid="table-pagination"]').should('be.visible')
  }
}

type UsdValue = { text: string; parsed: number }

const expectOrder = (actual: UsdValue[], order: 'asc' | 'desc') =>
  expect(JSON.stringify(actual), `Table values should be in ${order} order`).to.equal(
    JSON.stringify(orderBy(actual, 'parsed', order)),
  )

const getUsdValues = (cells: HTMLElement[]) =>
  cells.map(({ innerText }): UsdValue => ({ text: innerText, parsed: parseCompactUsd(innerText) }))

const expectTopUsdValuesOrder = (columnId: 'volume' | 'tvl', order: 'asc' | 'desc') =>
  cy
    .get(`[data-testid^="data-table-row-"] [data-testid="data-table-cell-${columnId}"]`)
    .should($cells => expectOrder(getUsdValues(Array.from($cells)), order))

describe('DEX Pools', () => {
  let breakpoint: Breakpoint
  let width: number, height: number

  beforeEach(() => {
    setupDexPoolListMocks()
    mockMerklCampaigns()
    ;[width, height, breakpoint] = oneViewport()
  })

  function assertSelectedFilterChip(chip: string) {
    if (breakpoint === 'mobile') {
      cy.get('[data-testid="btn-drawer-filter-dex-pools"]').click()
      cy.get('[data-testid="drawer-filter-menu-dex-pools"]').should('be.visible')
    }
    cy.get(`[data-testid="filter-chip-${chip}"]`).contains(/\(\d+\)/)
  }

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
      cy.wait('@dex-pools', API_LOAD_TIMEOUT)
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
      cy.wait('@dex-pools', API_LOAD_TIMEOUT)
    }

    it('sorts by volume', () => {
      expectTopUsdValuesOrder('volume', 'desc') // initial is Volume desc
      cy.url().should('not.include', 'volume') // initial sort not in URL
      if (breakpoint === 'mobile') return // on mobile, we cannot sort ascending at the moment
      sortBy('volume', 'asc')
      expectTopUsdValuesOrder('volume', 'asc')
      cy.url().should('include', 'sort=volume')
    })

    it('sorts by TVL (desc/asc)', () => {
      cy.url().should('not.include', 'tvl') // initial sort not in URL
      sortBy('tvl', 'desc')
      expectTopUsdValuesOrder('tvl', 'desc')
      cy.url().should('include', 'sort=-tvl')
      if (breakpoint === 'mobile') return // on mobile, we cannot sort ascending at the moment
      sortBy('tvl', 'asc')
      expectTopUsdValuesOrder('tvl', 'asc')
      cy.url().should('include', 'sort=tvl')
    })

    it('filters by pool type chip', () => {
      const poolType = oneOf('stableswapng', 'crypto')
      clickFilterChip(poolType)
      cy.url().should('include', `filter=${poolType}`)
      cy.get('[data-testid^="data-table-row-"]', API_LOAD_TIMEOUT).should('have.length.greaterThan', 0)
      assertSelectedFilterChip(poolType)
    })

    it('navigates to pool deposit page by clicking a row', () => {
      const poolLink = `[data-testid="market-link-${DEX_POOL_LIST_NAVIGATION_POOL.address}"]`

      if (breakpoint === 'mobile') {
        cy.get(poolLink, API_LOAD_TIMEOUT).closest('[data-testid^="data-table-row-"]').click()
        cy.get('[data-testid="collapse-icon"]').should('be.visible')
        cy.get('[data-testid="pool-link-deposit"]').click()
      } else {
        cy.get(poolLink, API_LOAD_TIMEOUT).click()
      }
      cy.url(LOAD_TIMEOUT).should(
        'include',
        `/dex/${DEX_POOL_LIST_NAVIGATION_POOL.network}/pools/${DEX_POOL_LIST_NAVIGATION_POOL.address}/deposit`,
      )
      cy.get('[data-testid="pool-form-tab-deposit"]', API_LOAD_TIMEOUT).should('be.visible')
    })
  })

  it('searches pools and preserves search after navigation', () => {
    visitAndWait(width, height)
    const filter = DEX_POOL_LIST_SEARCH
    cy.get('[data-testid="table-text-search-dex-pool-list"] input').type(filter)
    cy.url().should('include', `?search=${filter}`)
    cy.wait('@dex-pools', API_LOAD_TIMEOUT)
    cy.contains('[data-testid^="market-link-"]', filter, API_LOAD_TIMEOUT).should('be.visible')
    if (breakpoint === 'mobile') {
      cy.get('[data-testid^="data-table-row-"]').first().click()
      cy.get(`[data-testid="pool-link-deposit"]`).click()
    } else {
      cy.contains('[data-testid^="market-link-"]', filter).click()
    }
    cy.get('[data-testid="pool-form-tab-deposit"]', API_LOAD_TIMEOUT).should('be.visible')
    cy.window().then(win => win.history.go(-1))
    cy.url().should('include', `?search=${filter}`)
  })

  it('persists pool type filter across reload', () => {
    const filter = 'crypto'
    visitAndWait(width, height, { query: { filter } })
    cy.url().should('include', `filter=${filter}`)
    assertSelectedFilterChip(filter)
    cy.get(`[data-testid="filter-chip-${filter}"]`).click()
    cy.url().should('not.include', '?')
  })

  it('paginates', () => {
    const getPages = (...$buttons: JQuery[]) =>
      $buttons.flatMap(el => Cypress.$.makeArray(el)).map(e => e.dataset.testid?.replace('btn-page-', ''))

    // open page 5 (1-based)
    visitAndWait(width, height, { query: { page: '5' } })

    // Current page selected
    cy.get('[data-testid="btn-page-5"]').should('have.class', 'Mui-selected')
    cy.get('[data-testid^="btn-page-"]').then($buttons => {
      // last page is displayed in index -2, since the last item (-1) is 'next'. The one before the last is index -3.
      const [prevLastPage, lastPage] = getPages($buttons.eq($buttons.length - 3), $buttons.eq($buttons.length - 2))
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
      cy.get('[data-testid^="btn-page-"]').then($buttons =>
        expect(getPages($buttons)).to.deep.equal(['1', '2', 'ellipsis', `${prevLastPage}`, `${lastPage}`, 'next']),
      )

      // click on the last page and check again
      cy.get(`[data-testid="btn-page-${lastPage}"]`).click()
      cy.url().should('include', `?page=${lastPage}`)
      cy.get('[data-testid^="btn-page-"]').then($buttons =>
        expect(getPages($buttons)).to.deep.equal(['prev', '1', '2', 'ellipsis', `${prevLastPage}`, `${lastPage}`]),
      )
    })
  })
})
