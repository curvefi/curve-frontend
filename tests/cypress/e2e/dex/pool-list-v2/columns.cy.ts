import { PoolColumnId } from '@/dex/features/pool-list/columns'
import {
  setupDexPoolListV2Mocks,
  V2_POOL_FIXTURE_NOW,
  V2_POOL_FIXTURES,
} from '@cy/support/helpers/dex-pool-list-v2-mocks'
import {
  DESKTOP_VIEWPORT,
  getV2PoolCell,
  getV2PoolRow,
  showV2PoolColumns,
  visitV2PoolList,
} from '@cy/support/helpers/dex-pools-list-v2.helpers'
import { API_LOAD_TIMEOUT } from '@cy/support/ui'

const expectHeaderOrder = (expected: readonly PoolColumnId[]) =>
  cy.get('[data-testid="data-table-head"] [data-testid^="data-table-header-"]').should($headers => {
    const actual = [...$headers].map(header => header.dataset.testid?.replace('data-table-header-', ''))

    expect(actual).to.deep.equal(expected)
  })

const expectPoolBadgeSet = (address: string, expected: readonly string[]) =>
  getV2PoolRow(address)
    .find('[data-testid="pool-badges"] [data-testid^="badge-"]')
    .should($badges => {
      const actual = [...$badges].map(badge => badge.dataset.testid).toSorted()

      expect(actual).to.deep.equal(expected.toSorted())
    })

type TokenExpectation = { address: string; symbol?: string | null }

const expectTokenCell = (address: string, expected: readonly TokenExpectation[]) =>
  getV2PoolCell(address, PoolColumnId.Tokens)
    .find('[data-testid="pool-tokens"]')
    .should($cell => {
      const cell = $cell[0]
      const tokenItems = [...cell.children]

      expect(tokenItems).to.have.length(expected.length)
      expected.forEach(({ address: tokenAddress, symbol }, index) => {
        const tokenItem = tokenItems[index]
        const icon = tokenItem.querySelector(`[data-testid="token-icon-${tokenAddress}"]`)

        expect(tokenItem.textContent, `token ${index} label`).to.equal(symbol ?? '')
        expect(icon, `token ${index} icon`).to.not.equal(null)
        expect(tokenItem.lastElementChild, `token ${index} icon position`).to.equal(icon)
      })
    })

const SORTABLE_COLUMNS = [
  PoolColumnId.PoolName,
  PoolColumnId.NetRate,
  PoolColumnId.BaseRate,
  PoolColumnId.WeeklyBaseRate,
  PoolColumnId.CrvRate,
  PoolColumnId.RewardsRate,
  PoolColumnId.Volume,
  PoolColumnId.Tvl,
  PoolColumnId.Age,
] as const

const NON_SORTABLE_COLUMNS = [PoolColumnId.Tokens, PoolColumnId.Points] as const

const SERVER_SORT_CASES = [
  [PoolColumnId.NetRate, V2_POOL_FIXTURES.highRewards.address, V2_POOL_FIXTURES.empty.address],
  [PoolColumnId.BaseRate, V2_POOL_FIXTURES.volatile.address, V2_POOL_FIXTURES.empty.address],
  [PoolColumnId.WeeklyBaseRate, V2_POOL_FIXTURES.showcase.address, V2_POOL_FIXTURES.volatile.address],
  [PoolColumnId.CrvRate, V2_POOL_FIXTURES.showcase.address, V2_POOL_FIXTURES.alerts.address],
  [PoolColumnId.RewardsRate, V2_POOL_FIXTURES.highRewards.address, V2_POOL_FIXTURES.alerts.address],
  [PoolColumnId.Age, V2_POOL_FIXTURES.alerts.address, V2_POOL_FIXTURES.killed.address],
] as const

const getColumnHeader = (columnId: PoolColumnId) => cy.get(`[data-testid="data-table-header-${columnId}"]`)

const expectFirstPool = (address: string) =>
  cy
    .get('[data-testid^="data-table-row-"]', API_LOAD_TIMEOUT)
    .first()
    .find(`[data-testid="table-row-link-${address}"]`)
    .should('exist')

const DEFAULT_FULL_COLUMNS = [PoolColumnId.PoolName, PoolColumnId.NetRate, PoolColumnId.Volume, PoolColumnId.Tvl]
const OPTIONAL_FULL_COLUMNS = [
  PoolColumnId.Tokens,
  PoolColumnId.BaseRate,
  PoolColumnId.WeeklyBaseRate,
  PoolColumnId.CrvRate,
  PoolColumnId.RewardsRate,
  PoolColumnId.Points,
  PoolColumnId.Age,
]

const DEFAULT_LITE_COLUMNS = [PoolColumnId.PoolName, PoolColumnId.NetRate, PoolColumnId.Tvl]
const OPTIONAL_LITE_COLUMNS = [PoolColumnId.Tokens, PoolColumnId.CrvRate, PoolColumnId.RewardsRate, PoolColumnId.Points]
const FULL_ONLY_COLUMNS = [PoolColumnId.BaseRate, PoolColumnId.WeeklyBaseRate, PoolColumnId.Volume, PoolColumnId.Age]
const LITE_SORTABLE_COLUMNS = [
  PoolColumnId.PoolName,
  PoolColumnId.NetRate,
  PoolColumnId.CrvRate,
  PoolColumnId.RewardsRate,
  PoolColumnId.Tvl,
]
const LITE_NON_SORTABLE_COLUMNS = [PoolColumnId.Tokens, PoolColumnId.Points]
const LITE_COMPUTED_SORT_COLUMNS = [PoolColumnId.NetRate, PoolColumnId.CrvRate, PoolColumnId.RewardsRate]

describe('V2 pool-list columns', () => {
  beforeEach(() => {
    setupDexPoolListV2Mocks()
    cy.clock(V2_POOL_FIXTURE_NOW, ['Date'])
  })

  it('shows the default columns and reveals optional columns in their defined order', () => {
    visitV2PoolList({ viewport: DESKTOP_VIEWPORT })

    expectHeaderOrder(DEFAULT_FULL_COLUMNS)

    for (const { columnId, value } of [
      { columnId: PoolColumnId.Volume, value: '$6m' },
      { columnId: PoolColumnId.Tvl, value: '$10m' },
    ]) {
      getV2PoolCell(V2_POOL_FIXTURES.showcase.address, columnId)
        .find('[data-testid="pool-usd-value"]')
        .should('have.text', value)
    }

    for (const columnId of [PoolColumnId.Volume, PoolColumnId.Tvl]) {
      getV2PoolCell(V2_POOL_FIXTURES.highRewards.address, columnId)
        .find('[data-testid="pool-usd-value"]')
        .should('have.text', '-')
    }

    showV2PoolColumns(OPTIONAL_FULL_COLUMNS)

    expectHeaderOrder([
      PoolColumnId.PoolName,
      PoolColumnId.NetRate,
      PoolColumnId.BaseRate,
      PoolColumnId.WeeklyBaseRate,
      PoolColumnId.CrvRate,
      PoolColumnId.RewardsRate,
      PoolColumnId.Points,
      PoolColumnId.Tokens,
      PoolColumnId.Volume,
      PoolColumnId.Tvl,
      PoolColumnId.Age,
    ])
    getV2PoolCell(V2_POOL_FIXTURES.showcase.address, PoolColumnId.WeeklyBaseRate).should('contain.text', '20%')
    getV2PoolCell(V2_POOL_FIXTURES.showcase.address, PoolColumnId.Age)
      .find('[data-testid="pool-age"]')
      .should('have.text', '5 days')
    getV2PoolCell(V2_POOL_FIXTURES.killed.address, PoolColumnId.Age)
      .find('[data-testid="pool-age"]')
      .should('have.text', '-')
  })

  it('renders every token in a wrapping reversed row', () => {
    visitV2PoolList({ viewport: DESKTOP_VIEWPORT })
    showV2PoolColumns([PoolColumnId.Tokens])

    expectTokenCell(V2_POOL_FIXTURES.showcase.address, V2_POOL_FIXTURES.showcase.tradeable_coins)
  })

  it('only exposes sorting controls for server-supported columns', () => {
    visitV2PoolList({ viewport: DESKTOP_VIEWPORT })
    showV2PoolColumns(OPTIONAL_FULL_COLUMNS)

    for (const columnId of SORTABLE_COLUMNS) {
      getColumnHeader(columnId).find(`[data-testid^="icon-sort-${columnId}-"]`).should('exist')
    }
    for (const columnId of NON_SORTABLE_COLUMNS) {
      getColumnHeader(columnId).find(`[data-testid^="icon-sort-${columnId}-"]`).should('not.exist')
    }
  })

  it('sorts yield and age columns through the pools API', () => {
    visitV2PoolList({ viewport: DESKTOP_VIEWPORT })
    showV2PoolColumns([
      PoolColumnId.BaseRate,
      PoolColumnId.WeeklyBaseRate,
      PoolColumnId.CrvRate,
      PoolColumnId.RewardsRate,
      PoolColumnId.Age,
    ])

    for (const [columnId, firstDescending, firstAscending] of SERVER_SORT_CASES) {
      getColumnHeader(columnId).click()
      cy.wait('@dex-v2-pools', API_LOAD_TIMEOUT)
      expectFirstPool(firstDescending)
      getColumnHeader(columnId).click()
      cy.wait('@dex-v2-pools', API_LOAD_TIMEOUT)
      expectFirstPool(firstAscending)
    }
  })

  it('shows only supported columns on a Lite network', () => {
    visitV2PoolList({ network: 'taiko', viewport: DESKTOP_VIEWPORT })

    expectHeaderOrder(DEFAULT_LITE_COLUMNS)
    cy.get('[data-testid="btn-open-filters-dex-pools"]').should('not.exist')
    cy.get('[data-testid="dex-pool-filters-collapsible"]').should('not.exist')

    cy.get('[data-testid="btn-visibility-settings"]').click()
    for (const columnId of OPTIONAL_LITE_COLUMNS) {
      cy.get(`[data-testid="visibility-toggle-${columnId}"]`).should('exist')
    }
    for (const columnId of FULL_ONLY_COLUMNS) {
      cy.get(`[data-testid="visibility-toggle-${columnId}"]`).should('not.exist')
    }
    cy.get('body').click(0, 0)

    showV2PoolColumns(OPTIONAL_LITE_COLUMNS)
    expectHeaderOrder([
      PoolColumnId.PoolName,
      PoolColumnId.NetRate,
      PoolColumnId.CrvRate,
      PoolColumnId.RewardsRate,
      PoolColumnId.Points,
      PoolColumnId.Tokens,
      PoolColumnId.Tvl,
    ])

    expectTokenCell(V2_POOL_FIXTURES.lite.address, V2_POOL_FIXTURES.lite.coins)

    for (const columnId of LITE_SORTABLE_COLUMNS) {
      getColumnHeader(columnId).find(`[data-testid^="icon-sort-${columnId}-"]`).should('exist')
    }
    for (const columnId of LITE_NON_SORTABLE_COLUMNS) {
      getColumnHeader(columnId).find(`[data-testid^="icon-sort-${columnId}-"]`).should('not.exist')
    }
  })

  it('searches and sorts every Lite pool locally without refetching or applying the default TVL filter', () => {
    visitV2PoolList({ network: 'taiko', viewport: DESKTOP_VIEWPORT })

    cy.get('@dex-v2-pool-chains.all').should('have.length', 0)
    cy.get('@dex-v2-pools.all').should('have.length', 0)
    getV2PoolRow(V2_POOL_FIXTURES.liteLowTvl.address).should('be.visible')

    const getSearch = () => cy.get('[data-testid="table-text-search-dex-pool-list"]').find('input')
    for (const query of [
      'Taiko Lite',
      V2_POOL_FIXTURES.lite.address,
      V2_POOL_FIXTURES.lite.gauge_address!,
      V2_POOL_FIXTURES.lite.root_gauge_address!,
      'USDC',
      V2_POOL_FIXTURES.lite.coins[0].address,
      'USDT',
    ]) {
      getSearch().clear({ scrollBehavior: false }).type(query, { scrollBehavior: false })
      cy.get('[data-testid^="data-table-row-"]').should('have.length', 1)
      getV2PoolRow(V2_POOL_FIXTURES.lite.address).should('be.visible')
    }

    getSearch().clear({ scrollBehavior: false })
    cy.get('[data-testid^="data-table-row-"]').should('have.length', 2)

    cy.get(`[data-testid="data-table-header-${PoolColumnId.Tvl}"]`).click()
    expectFirstPool(V2_POOL_FIXTURES.liteLowTvl.address)

    showV2PoolColumns([PoolColumnId.CrvRate, PoolColumnId.RewardsRate])
    for (const columnId of LITE_COMPUTED_SORT_COLUMNS) {
      getColumnHeader(columnId).click()
      expectFirstPool(V2_POOL_FIXTURES.lite.address)
      getColumnHeader(columnId).click()
      expectFirstPool(V2_POOL_FIXTURES.liteLowTvl.address)
    }

    cy.get('@dex-v2-lite-pools.all').should('have.length', 1)
  })

  it('classifies representative pool types and adds status badges', () => {
    visitV2PoolList({ viewport: DESKTOP_VIEWPORT })

    expectPoolBadgeSet(V2_POOL_FIXTURES.showcase.address, ['badge-pool-type-stable', 'badge-pool-metapool'])

    expectPoolBadgeSet(V2_POOL_FIXTURES.volatile.address, ['badge-pool-type-volatile'])
    getV2PoolRow(V2_POOL_FIXTURES.volatile.address)
      .find('[data-testid="badge-pool-type-volatile"]')
      .should('have.text', 'Volatile')

    expectPoolBadgeSet(V2_POOL_FIXTURES.killed.address, ['badge-pool-type-stable', 'badge-pool-inactive-gauge'])
    getV2PoolRow(V2_POOL_FIXTURES.killed.address)
      .find('[data-testid="badge-pool-inactive-gauge"]')
      .should('have.text', 'Inactive gauge')
  })

  it('adds pool and token alert badges with severity colors', () => {
    visitV2PoolList({ viewport: DESKTOP_VIEWPORT })

    expectPoolBadgeSet(V2_POOL_FIXTURES.alerts.address, [
      'badge-pool-type-stable',
      'badge-pool-metapool',
      'badge-pool-inactive-gauge',
      'badge-pool-alert',
      'badge-token-alert',
    ])

    for (const { testId, severityClass } of [
      {
        testId: 'badge-pool-alert',
        severityClass: 'MuiChip-colorAccent',
      },
      {
        testId: 'badge-token-alert',
        severityClass: 'MuiChip-colorWarning',
      },
    ]) {
      const getAlertBadge = () => getV2PoolRow(V2_POOL_FIXTURES.alerts.address).find(`[data-testid="${testId}"]`)

      getAlertBadge().should('have.class', severityClass)
    }
  })
})
