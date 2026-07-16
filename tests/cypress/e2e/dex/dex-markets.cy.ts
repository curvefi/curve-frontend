import { orderBy } from 'lodash'
import { getPoolsTvlLabelRange, POOL_DEFAULT_TVL_MIN } from '@/dex/features/pool-list/filters/utils'
import { DEX_POOL_LIST_SEARCH, setupDexPoolListMocks } from '@cy/support/helpers/dex-pool-list-mocks'
import { mockMerklCampaigns } from '@cy/support/helpers/lending-mocks'
import { API_LOAD_TIMEOUT, type Breakpoint, LOAD_TIMEOUT, oneViewport } from '@cy/support/ui'
import { assert } from '@primitives/objects.utils'
import { getRangeFilterLabel } from '@ui-kit/shared/ui/DataTable/filters'

const DEFAULT_POOL_LIST_MIN_TVL_INPUT = '10k'
const POOL_LIST_FILTER_POOL_TYPE = 'crypto'
const POOL_LIST_FILTER_TVL_MIN = 480_000_000
const POOL_LIST_FILTER_TVL_MAX = 500_000_000
const POOL_LIST_FILTER_VOLUME_MAX = 500_000_000

type PoolListResponseBody = { pools?: { name?: string }[] }

const getPoolListResponseFirstPoolName = (body: unknown) =>
  assert((body as PoolListResponseBody).pools?.[0]?.name, 'No pool in DEX pool list response')

const waitForPoolListResponse = () =>
  cy.wait('@dex-pools', API_LOAD_TIMEOUT).then(({ response }) => {
    cy.contains(
      '[data-testid^="market-link-"]',
      getPoolListResponseFirstPoolName(response?.body),
      API_LOAD_TIMEOUT,
    ).should('be.visible')
  })

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
    network = 'arbitrum',
    ...options
  }: { network?: string; query?: Record<string, string> } & Partial<Cypress.VisitOptions> = {},
) {
  cy.viewport(width, height)
  cy.visitWithoutTestConnector(`dex/${network}/pools/${query ? `?${new URLSearchParams(query)}` : ''}`, options)
  waitForPoolListResponse()
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

const getPoolListTvlRangeChip = (minTvl: number, maxTvl: number) =>
  assert(
    getRangeFilterLabel(getPoolsTvlLabelRange([minTvl, maxTvl]), 'dollar', {
      defaultMin: null,
    }),
    'No TVL range filter chip label',
  )

const expectTopUsdValuesOrder = (columnId: 'volume' | 'tvl', order: 'asc' | 'desc') =>
  cy
    .get(`[data-testid^="data-table-row-"] [data-testid="data-table-cell-${columnId}"]`)
    .should($cells => expectOrder(getUsdValues(Array.from($cells)), order))

const expectUrlQueryParam = (key: string, value: string) =>
  cy.location('search').should(search => expect(new URLSearchParams(search).get(key)).to.equal(value))

const expectLastPoolRequestParams = (assertParams: (params: URLSearchParams) => void) =>
  cy.get('@dex-pools.all').should(interceptions => {
    const requests = interceptions as unknown as { request: { url: string } }[]
    const url = assert(requests[requests.length - 1]?.request.url, 'No DEX pool list request found')

    assertParams(new URL(url).searchParams)
  })

describe('DEX Pools', () => {
  let breakpoint: Breakpoint
  let width: number, height: number

  beforeEach(() => {
    setupDexPoolListMocks()
    mockMerklCampaigns()
    ;[width, height, breakpoint] = oneViewport()
  })

  const filtersButtonSelector = () => '[data-testid="btn-open-filters-dex-pools"]'
  const filtersMenuSelector = () =>
    breakpoint === 'mobile' ? '[data-testid="drawer-filter-menu-dex-pools"]' : '[data-testid="table-filters-popover"]'

  function openPoolFilters() {
    cy.get(filtersButtonSelector()).click({ waitForAnimations: true })
    cy.get(filtersMenuSelector()).should('be.visible')
  }

  function closePoolFilters() {
    if (breakpoint === 'mobile') {
      cy.get('body').click(0, 0)
    } else {
      cy.get('[data-testid="btn-close-filters"]').click()
    }
  }

  const assertSelectedFilterChip = () => cy.get('[data-testid="dex-pool-active-filter-type"]').should('be.visible')

  function expectPageResetAfter(action: () => void, { waitForRequest = true }: { waitForRequest?: boolean } = {}) {
    visitAndWait(width, height, { query: { page: '5' } })
    action()
    if (waitForRequest) {
      cy.wait('@dex-pools', API_LOAD_TIMEOUT)
    }
    cy.location('search').should('not.include', 'page=')
  }

  describe('First page', () => {
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

    function clickFilterChip(chip: string) {
      openPoolFilters()
      cy.get(`[data-testid="table-filter-btn-pool-filter-type-${chip}"]`).click()
      closePoolFilters()
      cy.wait('@dex-pools', API_LOAD_TIMEOUT)
    }

    function setRangeFilter(id: string, bound: 'min' | 'max', value: number | string) {
      openPoolFilters()
      cy.get(`[data-testid="range-filter-${id}-${bound}"] input`).clear().type(`${value}`).blur()
      closePoolFilters()
      return waitForPoolListResponse()
    }

    it('applies the default TVL min without URL or active filter state', () => {
      visitAndWait(width, height)
      cy.location('search').should('not.include', 'tvl=')
      expectLastPoolRequestParams(params => {
        expect(params.get('min_tvl')).to.equal(`${POOL_DEFAULT_TVL_MIN}`)
      })
      cy.get('[data-testid="dex-pool-active-filter-tvl"]').should('not.exist')
      openPoolFilters()
      cy.get('[data-testid="range-filter-tvl-min"] input').should('have.value', DEFAULT_POOL_LIST_MIN_TVL_INPUT)
      closePoolFilters()
    })

    it('sorts by TVL (desc/asc)', () => {
      visitAndWait(width, height)
      cy.url().should('not.include', 'tvl') // initial sort not in URL
      expectLastPoolRequestParams(params => {
        expect(params.get('min_tvl')).to.equal(`${POOL_DEFAULT_TVL_MIN}`)
        expect(params.get('sort_by')).to.equal('volume')
        expect(params.get('sort_direction')).to.equal('desc')
      })

      sortBy('tvl', 'desc')
      expectTopUsdValuesOrder('tvl', 'desc')
      cy.url().should('include', 'sort=-tvl')
      expectLastPoolRequestParams(params => {
        expect(params.get('sort_by')).to.equal('tvl')
        expect(params.get('sort_direction')).to.equal('desc')
      })

      if (breakpoint === 'mobile') return // on mobile, we cannot sort ascending at the moment
      sortBy('tvl', 'asc')
      expectTopUsdValuesOrder('tvl', 'asc')
      cy.url().should('include', 'sort=tvl')
      expectLastPoolRequestParams(params => {
        expect(params.get('sort_by')).to.equal('tvl')
        expect(params.get('sort_direction')).to.equal('asc')
      })
    })

    it('filters by pool type, persists after reload, and clears from the active chip', () => {
      visitAndWait(width, height)
      const poolType = POOL_LIST_FILTER_POOL_TYPE

      clickFilterChip(poolType)
      cy.url().should('include', `filter=${poolType}`)
      expectLastPoolRequestParams(params => {
        expect(params.get('pool_type')).to.equal(poolType)
      })
      cy.get('[data-testid^="data-table-row-"]', API_LOAD_TIMEOUT).should('have.length.greaterThan', 0)
      assertSelectedFilterChip()
      cy.reload()
      assertSelectedFilterChip()
      cy.get('[data-testid^="data-table-row-"]', API_LOAD_TIMEOUT).should('have.length.greaterThan', 0)
      cy.get('[data-testid="dex-pool-active-filter-type"]').click()
      cy.url().should('not.include', '?')
      cy.get('[data-testid="dex-pool-active-filter-type"]').should('not.exist')
      cy.get('[data-testid^="data-table-row-"]', API_LOAD_TIMEOUT).should('have.length.greaterThan', 0)
    })

    it('resets page when search changes', () => {
      expectPageResetAfter(() => {
        cy.get('[data-testid="table-text-search-dex-pool-list"] input').type(DEX_POOL_LIST_SEARCH)
      })
      cy.location('search').should('include', `search=${DEX_POOL_LIST_SEARCH}`)
    })

    it('resets page when a filter changes', () => {
      const poolType = POOL_LIST_FILTER_POOL_TYPE

      expectPageResetAfter(() => clickFilterChip(poolType), { waitForRequest: false })
      cy.location('search').should('include', `filter=${poolType}`)
    })

    it('filters by TVL range input', () => {
      visitAndWait(width, height)
      const minTvl = POOL_LIST_FILTER_TVL_MIN

      setRangeFilter('tvl', 'min', minTvl)
      expectLastPoolRequestParams(params => {
        expect(params.get('min_tvl')).to.equal(`${minTvl}`)
      })
      expectUrlQueryParam('tvl', `${minTvl}~`)
      cy.get('[data-testid="dex-pool-active-filter-tvl"]').should('be.visible')
    })

    it('filters by TVL max input with an explicit zero min in the URL and API request', () => {
      visitAndWait(width, height)
      const maxTvl = POOL_LIST_FILTER_TVL_MAX

      setRangeFilter('tvl', 'min', 0)
      expectUrlQueryParam('tvl', '0~')

      setRangeFilter('tvl', 'max', maxTvl)
      expectLastPoolRequestParams(params => {
        expect(params.get('min_tvl')).to.equal('0')
        expect(params.get('max_tvl')).to.equal(`${maxTvl}`)
      })
      // Direct range-input edits preserve the component's explicit zero lower bound.
      expectUrlQueryParam('tvl', `0~${maxTvl}`)
      cy.get('[data-testid="dex-pool-active-filter-tvl"]')
        .should('be.visible')
        .and('contain.text', getPoolListTvlRangeChip(0, maxTvl))
    })

    it('filters by Volume range input', () => {
      visitAndWait(width, height)
      const maxVolume = POOL_LIST_FILTER_VOLUME_MAX

      setRangeFilter('volume', 'max', maxVolume)
      expectLastPoolRequestParams(params => {
        expect(params.get('max_volume')).to.equal(`${maxVolume}`)
      })
      expectUrlQueryParam('volume', `~${maxVolume}`)
      cy.get('[data-testid="dex-pool-active-filter-volume"]').should('be.visible')
    })

    it('treats default TVL min as inactive', () => {
      visitAndWait(width, height, { query: { tvl: `${POOL_DEFAULT_TVL_MIN}~` } })
      expectLastPoolRequestParams(params => {
        expect(params.get('min_tvl')).to.equal(`${POOL_DEFAULT_TVL_MIN}`)
      })
      cy.get('[data-testid="dex-pool-active-filter-tvl"]').should('not.exist')
    })

    it('uses the default TVL min for max-only filtering without rewriting the URL', () => {
      const maxTvl = POOL_LIST_FILTER_TVL_MAX

      visitAndWait(width, height, { query: { tvl: `~${maxTvl}` } })
      expectLastPoolRequestParams(params => {
        expect(params.get('min_tvl')).to.equal(`${POOL_DEFAULT_TVL_MIN}`)
        expect(params.get('max_tvl')).to.equal(`${maxTvl}`)
      })
      cy.get('[data-testid="dex-pool-active-filter-tvl"]')
        .should('be.visible')
        .and('contain.text', getPoolListTvlRangeChip(POOL_DEFAULT_TVL_MIN, maxTvl))
    })

    it('keeps explicit zero TVL min as an active filter', () => {
      visitAndWait(width, height, { query: { tvl: '0~' } })
      expectLastPoolRequestParams(params => {
        expect(params.get('min_tvl')).to.equal('0')
      })
      expectUrlQueryParam('tvl', '0~')
      cy.get('[data-testid="dex-pool-active-filter-tvl"]').should('be.visible').and('contain.text', '>$0')
    })

    it('keeps zero Base vAPY min as an active filter', () => {
      visitAndWait(width, height, { query: { apy: '0~' } })
      expectLastPoolRequestParams(params => {
        expect(params.get('min_apy')).to.equal('0')
      })
      expectUrlQueryParam('apy', '0~')
      cy.get('[data-testid="dex-pool-active-filter-apy"]').should('be.visible')
    })

    it('navigates to pool deposit page by clicking a row', () => {
      visitAndWait(width, height)
      cy.get('[data-testid^="data-table-row-"]').first().click()
      if (breakpoint === 'mobile') {
        cy.get('[data-testid="collapse-icon"]').first().should('be.visible')
        cy.get('[data-testid="data-table-expansion-row"]').should('be.visible')
        cy.get('[data-testid="pool-link-deposit"]').click()
      }
      cy.url(LOAD_TIMEOUT).should('match', /\/dex\/\w+\/pools\/0x[0-9a-fA-F]{40}\/(deposit|swap)\/?$/)
      cy.title().should('match', /Curve - Pool - .* - Curve/)
    })
  })

  it('searches pools and preserves search after navigation', () => {
    visitAndWait(width, height, { network: 'ethereum' })
    const filter = DEX_POOL_LIST_SEARCH
    cy.get('[data-testid="table-text-search-dex-pool-list"] input').type(filter)
    cy.url().should('include', `?search=${filter}`)
    cy.wait('@dex-pools', API_LOAD_TIMEOUT)
    cy.contains('[data-testid^="market-link-"]', filter, API_LOAD_TIMEOUT).should('be.visible')
    if (breakpoint === 'mobile') {
      cy.get('[data-testid^="data-table-row-"]').first().click()
      cy.get('[data-testid="data-table-expansion-row"]').should('be.visible')
      cy.get(`[data-testid="pool-link-deposit"]`).click({ waitForAnimations: false })
    } else {
      cy.contains('[data-testid^="market-link-"]', filter).click()
    }
    cy.get('[data-testid="pool-form-tab-deposit"]', API_LOAD_TIMEOUT).should('be.visible')
    cy.window().then(win => win.history.go(-1))
    cy.url().should('include', `?search=${filter}`)
  })

  it('keeps search-only state out of active filter chips and empty reset clears search', () => {
    visitAndWait(width, height)
    cy.get('[data-testid="table-text-search-dex-pool-list"] input').type('no-such-pool')
    cy.wait('@dex-pools', API_LOAD_TIMEOUT)
    cy.url().should('include', '?search=no-such-pool')
    cy.get('[data-testid="table-empty-row"]').should('be.visible')
    cy.get('[data-testid^="dex-pool-active-filter-"]').should('not.exist')
    cy.get('[data-testid="dex-pool-empty-state-reset"]').click()
    cy.url().should('not.include', 'search=')
    cy.get('[data-testid^="data-table-row-"]', API_LOAD_TIMEOUT).should('have.length.greaterThan', 0)
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
