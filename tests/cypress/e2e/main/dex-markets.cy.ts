import { oneOf } from '@cy/support/generators'
import { setShowSmallPools } from '@cy/support/helpers/user-profile'
import { API_LOAD_TIMEOUT, type Breakpoint, LOAD_TIMEOUT, oneViewport } from '@cy/support/ui'

const PATH = '/dex/arbitrum/pools/'

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

function visitAndWait(width: number, height: number, options?: { page?: number } & Partial<Cypress.VisitOptions>) {
  cy.viewport(width, height)
  const { page } = options ?? {}
  cy.visit(`${PATH}${page ? `?page=${page}` : ''}`, options)
  cy.get('[data-testid^="data-table-row-"]', API_LOAD_TIMEOUT).should('have.length.greaterThan', 0)
  if (page) {
    cy.get('[data-testid="table-pagination"]').should('be.visible')
  }
}

const expectDesc = (values: number[]) =>
  expect(values, `values should be in descending order: ${values.join(', ')}`).to.deep.equal(
    [...values].sort((a, b) => b - a),
  )

const expectAsc = (values: number[]) =>
  expect(values, `values should be in ascending order: ${values.join(', ')}`).to.deep.equal(
    [...values].sort((a, b) => a - b),
  )

const getTopUsdValues = (columnId: 'volume' | 'tvl', n = 5) =>
  cy.get(`[data-testid="data-table-cell-${columnId}"]`).then(($cells) =>
    Cypress.$.makeArray($cells)
      .slice(0, n)
      .map((el) => parseCompactUsd((el as HTMLElement).innerText)),
  )

describe('DEX Pools', () => {
  let breakpoint: Breakpoint
  let width: number, height: number

  beforeEach(() => {
    ;[width, height, breakpoint] = oneViewport()
  })

  describe('First page', () => {
    beforeEach(() => {
      visitAndWait(width, height)
    })

    function sortBy(field: string) {
      if (breakpoint === 'mobile') {
        cy.get('[data-testid="btn-drawer-sort-dex-pools"]').click()
        cy.get(`[data-testid="drawer-sort-menu-dex-pools"] li[value="${field}"]`).click()
        cy.get('[data-testid="drawer-sort-menu-dex-pools"]').should('not.be.visible')
      } else {
        cy.get(`[data-testid="data-table-header-${field}"]`).click()
        cy.get('[data-testid="drawer-sort-menu-dex-pools"]').should('not.exist')
      }
    }

    function clickFilterChip(chip: string, isMobile = breakpoint === 'mobile') {
      if (isMobile) {
        cy.get('[data-testid="btn-drawer-filter-dex-pools"]').click()
        cy.get('[data-testid="drawer-filter-menu-dex-pools"]').should('be.visible')
      }
      cy.get(`[data-testid="filter-chip-${chip}"]`).click()
      cy.get('[data-testid="drawer-filter-menu-dex-pools"]').should(isMobile ? 'not.be.visible' : 'not.exist')
    }

    it('sorts by volume', () => {
      getTopUsdValues('volume').then((vals) => expectDesc(vals)) // initial is Volume desc
      cy.url().should('not.include', 'volume') // initial sort not in URL
      sortBy('volume')
      getTopUsdValues('volume').then((vals) => expectAsc(vals))
      cy.url().should('include', 'sort=volume')
    })

    it('sorts by TVL (desc/asc)', () => {
      cy.url().should('not.include', 'tvl') // initial sort not in URL
      sortBy('tvl')
      getTopUsdValues('tvl').then((vals) => expectDesc(vals))
      cy.url().should('include', 'sort=-tvl')
      sortBy('tvl')
      getTopUsdValues('tvl').then((vals) => expectAsc(vals))
      cy.url().should('include', 'sort=tvl')
    })

    it('filters by currency chip', () => {
      const currency = oneOf('usd', 'btc')
      cy.get('[data-testid^="data-table-row-"]').then(($before) => {
        const beforeCount = $before.length
        clickFilterChip(currency)
        cy.get('[data-testid^="data-table-row-"]').then(($after) => {
          const afterCount = $after.length
          expect(afterCount).to.be.lessThan(beforeCount)
          // chip is in the drawer for mobile, check on desktop only
          if (breakpoint !== 'mobile') cy.get(`[data-testid="filter-chip-${currency}"]`).contains(`(${afterCount})`)
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
      cy.url(LOAD_TIMEOUT).should('match', /\/dex\/arbitrum\/pools\/[^/]+\/deposit\/?$/)
      cy.title().should('match', /Curve - Pool - .* - Curve/)
    })
  })

  it('paginates', () => {
    const getPages = ($buttons: JQuery) =>
      Cypress.$.makeArray($buttons).map((el) => el.dataset.testid?.replace('btn-page-', ''))

    // open page 5 (1-based)
    visitAndWait(width, height, {
      page: 5,
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
})
